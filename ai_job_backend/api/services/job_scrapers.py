"""
Multi-source job listing scrapers (Playwright).
Uses Indeed first; if fewer than min_jobs, fills from ZipRecruiter, Glassdoor, LinkedIn.
Each scraper lives in its own module and returns list of dicts: title, company, location, source_url.
"""
import logging
from typing import Any

from api.services.scrapers.glassdoor_scraper import run_glassdoor_scrape
from api.services.scrapers.indeed_scraper import run_indeed_scrape
from api.services.scrapers.linkedin_scraper import run_linkedin_scrape
from api.services.scrapers.ziprecruiter_scraper import run_ziprecruiter_scrape

logger = logging.getLogger(__name__)


def run_multi_source_scrape(
    role_query: str,
    location_query: str,
    *,
    headless: bool = True,
    min_jobs: int = 10,
    max_jobs: int = 10,
) -> list[dict[str, Any]]:
    """
    Scrape job listings from multiple sources. Tries Indeed first; if result has fewer than
    min_jobs, fills from ZipRecruiter, then Glassdoor, then LinkedIn until we have at least
    min_jobs or no more sources. Returns list of dicts with title, company, location, source_url.
    """
    role = (role_query or "software engineer").replace(" ", "+")
    location = (location_query or "remote").replace(" ", "+")
    combined: list[dict[str, Any]] = []
    seen_urls: set[str] = set()

    def add_unique(jobs: list[dict[str, Any]]) -> None:
        for j in jobs:
            url = (j.get("source_url") or "").strip()
            if url and url not in seen_urls:
                seen_urls.add(url)
                combined.append(j)

    # 1) Indeed first
    indeed = run_indeed_scrape(role, location, headless=headless, max_jobs=max_jobs)
    add_unique(indeed)
    logger.info("Multi-source: Indeed returned %s, total so far %s", len(indeed), len(combined))

    if len(combined) >= min_jobs:
        return combined[:max_jobs]

    need = min_jobs - len(combined)
    # 2) ZipRecruiter
    if need > 0:
        zr = run_ziprecruiter_scrape(role, location, headless=headless, max_jobs=need)
        add_unique(zr)
        logger.info("Multi-source: ZipRecruiter returned %s, total %s", len(zr), len(combined))
        need = min_jobs - len(combined)

    # 3) Glassdoor
    if need > 0:
        gd = run_glassdoor_scrape(role, location, headless=headless, max_jobs=need)
        add_unique(gd)
        logger.info("Multi-source: Glassdoor returned %s, total %s", len(gd), len(combined))
        need = min_jobs - len(combined)

    # 4) LinkedIn
    if need > 0:
        li = run_linkedin_scrape(role, location, headless=headless, max_jobs=need)
        add_unique(li)
        logger.info("Multi-source: LinkedIn returned %s, total %s", len(li), len(combined))

    return combined[:max_jobs]
