"""
Glassdoor job listing scraper (Playwright).
Returns list of dicts: title, company, location, source_url.
"""
import logging
from pathlib import Path
from typing import Any
from urllib.parse import quote

from playwright.sync_api import sync_playwright

logger = logging.getLogger(__name__)
_DEBUG_DIR = Path(__file__).resolve().parent.parent.parent


def run_glassdoor_scrape(
    role_query: str,
    location_query: str,
    *,
    headless: bool = True,
    max_jobs: int = 15,
) -> list[dict[str, Any]]:
    """Scrape Glassdoor job listings. Returns same shape as Indeed."""
    role = (role_query or "software engineer").replace("+", " ").strip()
    location = (location_query or "remote").replace("+", " ")
    scraped: list[dict[str, Any]] = []
    kw = quote(role.replace(" ", "-").lower()[:30], safe="-")
    url = f"https://www.glassdoor.com/Job/{kw}-jobs-SRCH_KO0,{min(99, len(role))}.htm"
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

        def _is_challenge_page() -> bool:
            """True if we got Cloudflare / Glassdoor bot verification page instead of job listings."""
            try:
                title = (page.title() or "").strip().lower()
                if "just a moment" in title:
                    return True
                body = (page.inner_text("body") or "")[:2000]
                if "help us protect glassdoor" in body.lower() or "verify that you're a real person" in body.lower():
                    return True
                return False
            except Exception:
                return False

        try:
            page.goto(url, wait_until="load", timeout=35000)
            page.wait_for_timeout(3000)
            if _is_challenge_page():
                logger.warning("Glassdoor returned bot/challenge page; waiting briefly for Turnstile.")
                page.wait_for_timeout(12000)
                if _is_challenge_page():
                    logger.warning("Glassdoor still on challenge page; skipping Glassdoor (no jobs).")
                    context.close()
                    browser.close()
                    return []
            for sel in [
                "button >> text=Accept",
                "button >> text=Accept All",
                "button >> text=I agree",
                "[data-consent-accept]",
                "#onetrust-accept-btn-handler",
            ]:
                try:
                    btn = page.query_selector(sel)
                    if btn and btn.is_visible():
                        btn.click()
                        page.wait_for_timeout(2000)
                        break
                except Exception:
                    continue
            page.wait_for_timeout(5000)
            try:
                page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
                page.wait_for_timeout(2000)
            except Exception:
                pass
            cards = page.query_selector_all("[data-job], .JobCard, .jobCard, li[class*='JobCard']")
            if not cards:
                cards = page.query_selector_all("a[href*='/Job/job-detail'], a[href*='glassdoor.com/job-listing']")
            if not cards:
                cards = page.query_selector_all("[class*='job-card'], [class*='JobCard']")
            if not cards:
                if _is_challenge_page():
                    logger.warning("Glassdoor: no job cards (page is Cloudflare/Glassdoor bot challenge).")
                else:
                    logger.warning("Glassdoor: no job cards found.")
                try:
                    (_DEBUG_DIR / "glassdoor_debug.html").write_text(page.content(), encoding="utf-8")
                    logger.info("Glassdoor: saved page HTML to api/glassdoor_debug.html")
                except Exception as e:
                    logger.warning("Glassdoor: could not save debug HTML: %s", e)
            for card in cards[:max_jobs]:
                try:
                    is_anchor = card.evaluate("el => el.tagName === 'A'")
                    link_el = card if is_anchor else card.query_selector("a[href*='job'], a[href*='Job']")
                    if not link_el:
                        link_el = card.query_selector("a")
                    href = link_el.get_attribute("href") if link_el else ""
                    if not href:
                        continue
                    job_url = href if href.startswith("http") else f"https://www.glassdoor.com{href}"
                    title_el = card.query_selector("a[data-test='job-link'], h2, [class*='title']")
                    company_el = card.query_selector("[data-test='employer-name'], [class*='employer'], .EmployerCard")
                    loc_el = card.query_selector("[data-test='location'], [class*='location']")
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
                    logger.debug("Glassdoor card parse skip: %s", e)
                    continue
        except Exception as e:
            logger.warning("Glassdoor scrape failed: %s", e)
        context.close()
        browser.close()
    return scraped
