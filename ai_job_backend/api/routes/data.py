"""
Data routes: backend fetches from Supabase. User id from verified JWT.
"""
import asyncio
import logging
import os
import sys
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from api.dependencies.auth import get_current_user_id
from api.services.description_enricher import fetch_job_page_content
from api.services.job_scrapers import run_multi_source_scrape
from api.services.resume_extractor import extract_text_from_resume
from api.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/data", tags=["data"])

JOBS_COLUMNS = "id, user_id, title, company, location, work_mode, source_url, description, salary_range, ai_analysis, status, applied_at, created_at, updated_at"

_scrape_status: dict[str, dict[str, Any]] = {}


def _run_scrape_my_jobs(user_id: str) -> None:
    """Fast Scrape & Save: multi-source scrape -> map -> bulk insert. Same path on Windows and Linux."""
    try:
        _scrape_status[user_id] = {"status": "processing", "finished_at": None}
        logger.info("Starting fast scrape for user_id=%s", user_id)
        if sys.platform == "win32":
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        supabase = get_supabase()
        prefs_resp = (
            supabase.table("user_preferences")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        prefs = prefs_resp.data or {}
        roles = prefs.get("roles") or prefs.get("role_values") or []
        role_query = (roles[0] if roles else "software engineer").replace(" ", "+")
        locations = prefs.get("locations") or []
        location_query = (locations[0] if locations else "remote").replace(" ", "+")

        raw = run_multi_source_scrape(
            role_query, location_query, headless=True, min_jobs=15, max_jobs=15
        )
        if not raw:
            _scrape_status[user_id] = {
                "status": "failed",
                "finished_at": datetime.now(tz=timezone.utc).isoformat(),
            }
            logger.warning("Fast scrape: no jobs found for user_id=%s", user_id)
            return

        job_list = [
            {
                "user_id": user_id,
                "title": item.get("title") or "Job",
                "company": item.get("company") or "Company",
                "location": item.get("location") or "",
                "source_url": item.get("source_url"),
                "description": "Click link for full details",
                "ai_analysis": {"match_score": None},
                "status": None,
            }
            for item in raw
        ]
        supabase.table("jobs").insert(job_list).execute()
        _scrape_status[user_id] = {
            "status": "finished",
            "finished_at": datetime.now(tz=timezone.utc).isoformat(),
        }
        logger.info("Fast scrape: saved %s jobs for user_id=%s", len(job_list), user_id)
        logger.info("Scraping finished successfully for user_id=%s", user_id)
    except Exception as e:
        logger.exception("scrape_my_jobs failed: %s", e)
        _scrape_status[user_id] = {
            "status": "failed",
            "finished_at": datetime.now(tz=timezone.utc).isoformat(),
        }


@router.get("/scrape-status")
def get_scrape_status(user_id: str = Depends(get_current_user_id)):
    entry = _scrape_status.get(user_id, {"status": "idle", "finished_at": None})
    return {"status": entry.get("status", "idle"), "finished_at": entry.get("finished_at")}


@router.post("/scrape-my-jobs")
def scrape_my_jobs(
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
):
    background_tasks.add_task(_run_scrape_my_jobs, user_id)
    logger.info("POST /data/scrape-my-jobs accepted for user_id=%s", user_id)
    return JSONResponse(content={"status": "processing"}, status_code=202)


@router.get("/profile")
def get_profile(user_id: str = Depends(get_current_user_id)):
    try:
        supabase = get_supabase()
        prefs = (
            supabase.table("user_preferences")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        personal = (
            supabase.table("user_personal_info")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        return {
            "data": {
                "job_prefs": prefs.data or {},
                "info": personal.data or {},
            },
            "error": None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-resume-text")
def extract_resume_text(user_id: str = Depends(get_current_user_id)):
    """
    Read user's resume from Storage (user_personal_info.resume_url), extract text,
    update user_personal_info.resume_text. Returns when done. Call after resume upload.
    """
    try:
        supabase = get_supabase()
        personal = (
            supabase.table("user_personal_info")
            .select("resume_url")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        data = personal.data if isinstance(personal.data, dict) else {}
        resume_url = (data.get("resume_url") or "").strip()
        if not resume_url:
            raise HTTPException(status_code=400, detail="No resume uploaded. Upload a resume first.")
        try:
            file_bytes = supabase.storage.from_("resumes").download(resume_url)
        except Exception as e:
            logger.warning("Resume download failed for %s: %s", resume_url[:80], e)
            raise HTTPException(status_code=404, detail="Resume file not found in storage.")
        filename = resume_url.split("/")[-1] if "/" in resume_url else resume_url
        text = extract_text_from_resume(file_bytes, filename)
        resume_text = (text or "").strip() or None
        supabase.table("user_personal_info").update({
            "resume_text": resume_text,
            "updated_at": datetime.now(tz=timezone.utc).isoformat(),
        }).eq("user_id", user_id).execute()
        logger.info("Extracted resume text for user_id=%s, length=%s", user_id, len(resume_text or ""))
        return {"ok": True, "resume_text_length": len(resume_text or "")}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("extract_resume_text failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/relevant-jobs")
def get_relevant_jobs(
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(50, ge=1, le=100),
):
    try:
        supabase = get_supabase()
        r = (
            supabase.table("jobs")
            .select(JOBS_COLUMNS)
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"data": r.data, "error": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-my-jobs")
def analyze_my_jobs(
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
):
    """ Analyze the jobs using AI. Requires AZURE_DEEPSEEK_API_KEY."""
    if not os.getenv("AZURE_DEEPSEEK_API_KEY"):
        raise HTTPException(status_code=503, detail="AI analysis not configured (AZURE_DEEPSEEK_API_KEY)")
    background_tasks.add_task(_run_analyze_my_jobs, user_id)
    return JSONResponse(content={"status": "processing"}, status_code=202)


def _run_analyze_my_jobs(user_id: str) -> None:
    """ Analyze the jobs using AI. Requires AZURE_DEEPSEEK_API_KEY."""
    try:
        from api.services.job_analysis import build_profile_text, get_ai_analysis

        supabase = get_supabase()
        base = os.getenv("AZURE_DEEPSEEK_ENDPOINT")
        key = os.getenv("AZURE_DEEPSEEK_API_KEY")
        if not key:
            return
        from openai import OpenAI
        client = OpenAI(base_url=base or None, api_key=key)
        prefs_resp = (
            supabase.table("user_preferences")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        personal_resp = (
            supabase.table("user_personal_info")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        prefs = prefs_resp.data or {}
        personal = personal_resp.data or {}
        # Get the resume text from the personal info (string or None)
        raw = personal.get("resume_text") if isinstance(personal, dict) else None
        resume_text: str | None = raw if isinstance(raw, str) else None
        # Build the profile text
        profile_text = build_profile_text(prefs, resume_text)
        r = supabase.table("jobs").select(JOBS_COLUMNS).eq("user_id", user_id).execute()
        jobs = r.data or []
        for job in jobs:
            if (job.get("ai_analysis") or {}).get("match_score") is not None:
                continue
            job_id = job.get("id")
            source_url = (job.get("source_url") or "")
            try:
                # Fetch job page content (HTML/text) from URL, or use existing description
                job_content = ""
                if source_url:
                    job_content = fetch_job_page_content(source_url, max_chars=15000)

                # 2. Fallback: Use existing description if URL fetch failed        
                if not job_content or len(job_content.strip()) < 50:
                    job_content = (job.get("description") or "").strip()

                # 3. Call AI to analyze and extract all fields    
                result = get_ai_analysis(job_content, profile_text, client)

               # 4. Construct the update payload - ALWAYS overwrite existing fields with AI results
                # We use .get() to ensure we don't crash if a key is missing
                update_payload: dict[str, Any] = {
                    "ai_analysis": result.get("ai_analysis") or {},
                    "work_mode": result.get("work_mode"),
                    "description": result.get("description"),
                    "salary_range": result.get("salary_range")
                }

                # 5. Clean the payload: Remove None values so we don't nullify data if AI fails to find a specific field
                update_payload = {k: v for k, v in update_payload.items() if v is not None}

                # 6. Update Supabase (This will overwrite current values in the DB)
                if update_payload:
                    supabase.table("jobs").update(update_payload).eq("id", job_id).execute()
                    logger.info(f"Successfully overwrote and updated data for job {job_id}")

                
            except Exception as e:
                logger.warning("AI analysis failed for job %s: %s", job_id, e)
    except Exception as e:
        logger.exception("analyze_my_jobs failed: %s", e)
