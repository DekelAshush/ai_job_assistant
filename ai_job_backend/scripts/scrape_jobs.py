"""
Fast Scrape & Save: multi-source scrape only, then bulk insert to Supabase.
Used as subprocess on Windows. No enrichment, no AI.
Usage: python scripts/scrape_jobs.py <user_id>
Expects env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
"""
import logging
import os
import sys

_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

from api.services.job_scrapers import run_multi_source_scrape
from api.services.supabase_client import get_supabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> int:
    if len(sys.argv) < 2:
        logger.error("Usage: python scripts/scrape_jobs.py <user_id>")
        return 1
    user_id = sys.argv[1].strip()
    if not user_id:
        logger.error("user_id is required")
        return 1

    try:
        supabase = get_supabase()
    except Exception as e:
        logger.exception("Supabase client failed: %s", e)
        return 1

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
        logger.warning("Fast scrape: no jobs found for user_id=%s", user_id)
        return 1

    job_list = [
        {
            "user_id": user_id,
            "title": item.get("title") or "Job",
            "company": item.get("company") or "Company",
            "location": item.get("location") or "",
            "source_url": item.get("source_url"),
            "description": "Click link for full details",
            "ai_analysis": None,
            "status": None,
        }
        for item in raw
    ]
    try:
        supabase.table("jobs").insert(job_list).execute()
    except Exception as e:
        logger.exception("Bulk insert failed: %s", e)
        return 1
    logger.info("Fast scrape: saved %s jobs for user_id=%s", len(job_list), user_id)
    logger.info("Scraping finished successfully for user_id=%s", user_id)
    return 0


if __name__ == "__main__":
    sys.exit(main())
