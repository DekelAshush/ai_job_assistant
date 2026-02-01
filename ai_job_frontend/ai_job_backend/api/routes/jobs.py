import asyncio
import os
import sys

from fastapi import APIRouter, HTTPException
from openai import OpenAI
from playwright.async_api import async_playwright

from api import models
from api.dependencies import db_dependency, user_dependency
from api.schemas import JobAnalysisRequest, JobAnalysisResponse

# Ensure Windows event loop works for Playwright when imported directly
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

router = APIRouter(prefix="/jobs", tags=["jobs"])

client = OpenAI(
    base_url=os.getenv("AZURE_DEEPSEEK_ENDPOINT"),
    api_key=os.getenv("AZURE_DEEPSEEK_API_KEY"),
)


@router.get("/health")
def health_check():
    """Verify jobs service status."""
    return {"status": "online", "service": "jobs"}


@router.post("/analyze", response_model=JobAnalysisResponse)
async def analyze_job(
    payload: JobAnalysisRequest,
    db: db_dependency,
    user: user_dependency,
):
    """Scrape and analyze a job posting. Requires JWT."""
    current_user_id = user.get("id")
    url = payload.url

    # 1) Scrape
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            job_description = await page.inner_text("body")
            page_title = await page.title()
            await browser.close()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Scraping failed: {str(e)}")

    # 2) Analyze (placeholder AI call)
    try:
        completion = client.chat.completions.create(
            model="DeepSeek-R1",
            messages=[
                {
                    "role": "system",
                    "content": "You are a specialized HR AI assistant. Analyze jobs for a candidate with a B.Sc. in Computer Science and Cybersecurity.",
                },
                {
                    "role": "user",
                    "content": f"Provide match score (0-100) and analysis for: {job_description[:3000]}",
                },
            ],
        )
        ai_response = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")

    # 3) Persist
    new_job = models.Job(
        title=page_title[:150],
        company="Extracted via AI",
        location="TBD",
        url=url,
        description_raw=job_description[:5000],
        ai_analysis={"analysis_text": ai_response},
        owner_id=current_user_id,
        status="analyzed",
    )

    try:
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="Job already analyzed or Database error."
        )

    return JobAnalysisResponse(
        job_id=new_job.id,
        analysis=ai_response,
        created_at=new_job.created_at,
    )
