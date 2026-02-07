"""
AI analysis for jobs: compare job description to candidate profile and return
only match_score (0-100). Job description is kept as scraped from the web (not from AI).
"""
import json
import logging
import os
import re
from typing import Any

from openai import OpenAI

logger = logging.getLogger(__name__)


def get_openai_client() -> OpenAI:
    base = os.getenv("AZURE_DEEPSEEK_ENDPOINT")
    key = os.getenv("AZURE_DEEPSEEK_API_KEY")
    if not key:
        raise RuntimeError("AZURE_DEEPSEEK_API_KEY not set")
    return OpenAI(base_url=base or None, api_key=key)

DEFAULT_PROFILE = "CS Student in Washington D.C., Full-Stack developer."


def build_profile_text(prefs: dict[str, Any], resume_text: str | None = None) -> str:
    """
    Build candidate profile string. 
    Combines BOTH the professional experience (resume) 
    AND current preferences (salary, location, roles).
    """
    parts = []

    # 1. הוספת העדפות אישיות (Preferences)
    parts.append("### CANDIDATE PREFERENCES & CONSTRAINTS ###")
    if prefs.get("job_status"):
        parts.append(f"Current Status: {prefs['job_status']}")
    if prefs.get("expected_salary"):
        parts.append(f"Expected Salary: {prefs['expected_salary']}")
    if prefs.get("locations"):
        loc = prefs["locations"]
        parts.append(f"Target Locations: {', '.join(loc) if isinstance(loc, list) else loc}")
    if prefs.get("work_modes"):
        parts.append(f"Preferred Work Modes: {', '.join(prefs['work_modes']) if isinstance(prefs['work_modes'], list) else prefs['work_modes']}")
    if prefs.get("skills_prefer"):
        sk = prefs["skills_prefer"]
        parts.append(f"Key Skills to highlight: {', '.join(sk) if isinstance(sk, list) else sk}")
    
    # 2. הוספת קורות החיים (Professional Experience)
    if resume_text and resume_text.strip():
        parts.append("\n### PROFESSIONAL EXPERIENCE (RESUME) ###")
        parts.append(resume_text.strip())

    # אם אין כלום, מחזירים פרופיל ברירת מחדל
    if not parts or (len(parts) == 1 and "PREFERENCES" in parts[0]):
        return DEFAULT_PROFILE

    return "\n".join(parts)


def get_ai_analysis(
    job_input: str,
    profile_text: str,
    client: Any,
    model: str = "DeepSeek-R1",
) -> dict[str, Any]:
    """
    Extract job details from HTML or plain text, then compare to profile.
    job_input: raw HTML or plain job description (from fetched page).
    Returns dict with optional work_mode, description, salary_range, and ai_analysis
    (match_score 0-100 + fit_reason). Only fill fields the AI can extract; caller
    merges into job row (e.g. only set empty columns).
    """
    job_input = (job_input or "").strip()
    if len(job_input) < 50:
        logger.warning("Job input too short to analyze.")
        return {
            "ai_analysis": {"match_score": 0, "fit_reason": "Job content too short to analyze."},
        }

    prompt = f"""You are an expert recruiter. I will provide you with a Job Posting (which might be in raw HTML format) and my Candidate Profile.

STEP 1: If the input is HTML, extract the actual Job Description, Requirements, and Responsibilities into plain text. Also extract: work mode (Remote / Hybrid / On-site), and salary range if mentioned.
STEP 2: Compare the extracted job details to my profile.
STEP 3: Return ONLY a valid JSON object with these keys (use null for any you cannot determine):
- "work_mode": string, one of "Remote", "Hybrid", "On-site", or null
- "description": string, the extracted or cleaned job description (plain text, up to 8000 chars), or null to leave as-is
- "salary_range": string, e.g. "$120k - $150k" or "Not specified", or null
- "match_score": number 0-100 (how well the job fits my profile)
- "fit_reason": string, 1-3 sentences explaining why this job is or isn't a good fit for my profile

My profile:
{profile_text[:2000]}

Job input (description or HTML):
{job_input[:15000]}

Return only the JSON object, no markdown or extra text."""

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You extract job details from HTML and return only valid JSON with keys: work_mode, description, salary_range, match_score, fit_reason."},
                {"role": "user", "content": prompt},
            ],
        )
        raw = (completion.choices[0].message.content or "").strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```\w*\n?", "", raw)
            raw = re.sub(r"\n?```\s*$", "", raw)
        data = json.loads(raw)
        score = data.get("match_score")
        if isinstance(score, (int, float)):
            score = max(0, min(100, int(score)))
        else:
            score = 50
        fit_reason = data.get("fit_reason")
        if not isinstance(fit_reason, str):
            fit_reason = "Analysis completed."
        result: dict[str, Any] = {
            "ai_analysis": {"match_score": score, "fit_reason": fit_reason[:2000]},
        }
        if isinstance(data.get("work_mode"), str) and data["work_mode"].strip():
            result["work_mode"] = data["work_mode"].strip()
        if isinstance(data.get("description"), str) and data["description"].strip():
            result["description"] = data["description"].strip()[:12000]
        if isinstance(data.get("salary_range"), str) and data["salary_range"].strip():
            result["salary_range"] = data["salary_range"].strip()[:200]
        return result
    except Exception as e:
        logger.warning("AI analysis failed: %s", e)
        return {"ai_analysis": {"match_score": 50, "fit_reason": f"Analysis failed: {e!s}"}}
