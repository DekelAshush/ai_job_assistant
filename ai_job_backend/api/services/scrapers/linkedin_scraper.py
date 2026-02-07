"""
LinkedIn job listing scraper (Playwright). May show login wall.
Returns list of dicts: title, company, location, source_url.
"""
import logging
from pathlib import Path
from typing import Any
from urllib.parse import quote

from playwright.sync_api import sync_playwright

logger = logging.getLogger(__name__)
_DEBUG_DIR = Path(__file__).resolve().parent.parent.parent


def run_linkedin_scrape(
    role_query: str,
    location_query: str,
    *,
    headless: bool = True,
    max_jobs: int = 15,
) -> list[dict[str, Any]]:
    """Scrape LinkedIn job listings (public search). May show login wall. Returns same shape as Indeed."""
    role = (role_query or "software engineer").replace("+", " ")
    location = (location_query or "remote").replace("+", " ")
    scraped: list[dict[str, Any]] = []
    url = f"https://www.linkedin.com/jobs/search/?keywords={quote(role)}&location={quote(location)}"
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=headless,
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = browser.new_context(
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        page = context.new_page()
        try:
            page.goto(url, wait_until="load", timeout=30000)
            page.wait_for_timeout(4000)
            for sel in [
                "button >> text=Accept",
                "button >> text=Accept All",
                "button >> text=Allow",
                "[data-consent-accept]",
            ]:
                try:
                    btn = page.query_selector(sel)
                    if btn and btn.is_visible():
                        btn.click()
                        page.wait_for_timeout(2000)
                        break
                except Exception:
                    continue
            page.wait_for_timeout(4000)
            try:
                page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
                page.wait_for_timeout(2000)
            except Exception:
                pass
            cards = page.query_selector_all(".job-search-card, .jobs-search__results-list li, [data-job-id]")
            if not cards:
                cards = page.query_selector_all("a[href*='/jobs/view/']")
            if not cards:
                cards = page.query_selector_all("[class*='job-card'], [class*='jobs-search-results'] li")
            if not cards:
                logger.warning("LinkedIn: no job cards found (login wall or layout change).")
                try:
                    (_DEBUG_DIR / "linkedin_debug.html").write_text(page.content(), encoding="utf-8")
                    logger.info("LinkedIn: saved page HTML to linkedin_debug.html")
                except Exception as e:
                    logger.warning("LinkedIn: could not save debug HTML: %s", e)
            for card in cards[:max_jobs]:
                try:
                    is_anchor = card.evaluate("el => el.tagName === 'A'")
                    link_el = card if is_anchor else card.query_selector("a[href*='/jobs/view/']")
                    if not link_el:
                        link_el = card.query_selector("a")
                    href = link_el.get_attribute("href") if link_el else ""
                    if not href or "/jobs/view/" not in href:
                        continue
                    job_url = (href.split("?")[0] if href.startswith("http") else f"https://www.linkedin.com{href.split('?')[0]}")
                    title_el = card.query_selector(".job-search-card__title, h3, [class*='title']")
                    company_el = card.query_selector(".job-search-card__subtitle, [class*='company']")
                    loc_el = card.query_selector(".job-search-card__location, [class*='location']")
                    title = (title_el.inner_text() if title_el else "").strip() or "Job"
                    company = (company_el.inner_text() if company_el else "").strip() or "Company"
                    location_text = (loc_el.inner_text() if loc_el else "").strip() or location
                    scraped.append({
                        "title": title[:500],
                        "company": company[:500],
                        "location": location_text[:300],
                        "source_url": job_url[:2000],
                    })
                    if len(scraped) >= max_jobs:
                        break
                except Exception as e:
                    logger.debug("LinkedIn card parse skip: %s", e)
                    continue
        except Exception as e:
            logger.warning("LinkedIn scrape failed: %s", e)
        context.close()
        browser.close()
    return scraped
