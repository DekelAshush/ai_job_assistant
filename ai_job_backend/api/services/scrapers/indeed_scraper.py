"""
Shared Indeed job listing scraper (Playwright). Used by scripts/scrape_jobs.py,
scripts/test_scrape.py, and api/routes/data.py.
Returns list of dicts: title, company, location, source_url.
"""
import logging
import os
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

logger = logging.getLogger(__name__)

# When no job cards found, save page HTML here for debugging (set INDEED_DEBUG=1 to enable)
_DEBUG_DIR = Path(__file__).resolve().parent.parent.parent

# Placeholder job IDs Indeed sometimes injects in the DOM; skip them
_FAKE_JOB_IDS = ("cdef0123456789ab", "0f1e2d3c4b5a6978")


def run_indeed_scrape(
    role_query: str,
    location_query: str,
    *,
    headless: bool = True,
    max_jobs: int = 15,
) -> list[dict[str, Any]]:
    """
    Scrape Indeed job listings. role_query and location_query should be
    URL-ready (e.g. "software+engineer", "remote").
    Returns list of dicts with keys: title, company, location, source_url.
    """
    role_query = role_query.replace(" ", "+")
    location_query = location_query.replace(" ", "+")
    scraped: list[dict[str, Any]] = []
    url = f"https://www.indeed.com/jobs?q={role_query}&l={location_query}"
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
            """True if we got Cloudflare / Indeed security/captcha page instead of job listings."""
            try:
                title = (page.title() or "").strip().lower()
                if "just a moment" in title or "security check" in title:
                    return True
                body = (page.inner_text("body") or "")[:3000]
                if "additional verification required" in body.lower() or "your ray id" in body.lower():
                    return True
                return False
            except Exception:
                return False

        page.goto(url, wait_until="domcontentloaded", timeout=25000)
        page.wait_for_timeout(2000)
        if _is_challenge_page():
            logger.warning("Indeed returned bot/challenge page; waiting briefly for Turnstile.")
            page.wait_for_timeout(12000)
            if _is_challenge_page():
                logger.warning("Indeed still on challenge page; skipping Indeed (no jobs).")
                context.close()
                browser.close()
                return []
        # Dismiss cookie/consent banners so job list is visible
        consent_selectors = [
            "button >> text=Accept",
            "button >> text=Accept All",
            "button >> text=I understand",
            "[data-consent-accept]",
            "#onetrust-accept-btn-handler",
            "button >> text=Allow all",
        ]
        for sel in consent_selectors:
            try:
                btn = page.query_selector(sel)
                if btn and btn.is_visible():
                    btn.click()
                    page.wait_for_timeout(1500)
                    break
            except Exception:
                continue
        # Wait for job content (Indeed may use different structures)
        for selector in [
            ".jobsearch-SerpJobCard",
            "[data-jk]",
            "td.resultContent",
            ".job_seen_beacon",
            'div[data-tn-component="organicJob"]',
        ]:
            try:
                page.wait_for_selector(selector, timeout=10000)
                break
            except Exception:
                continue
        page.wait_for_timeout(2500)
        # Scroll to trigger lazy-loaded results
        try:
            page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
            page.wait_for_timeout(1500)
        except Exception:
            pass
        cards = page.query_selector_all(".jobsearch-SerpJobCard")
        if not cards:
            cards = page.query_selector_all('div[data-tn-component="organicJob"]')
        if not cards:
            cards = page.query_selector_all(".job_seen_beacon")
        if not cards:
            cards = page.query_selector_all("td.resultContent")
        if not cards:
            jk_elements = page.query_selector_all("[data-jk]")
            cards = []
            seen_jk = set()
            for el in jk_elements[:20]:
                jk = el.get_attribute("data-jk") or ""
                if jk in seen_jk:
                    continue
                seen_jk.add(jk)
                handle = el.evaluate_handle(
                    'node => node.closest(\'div[class*="job"]\') || node.closest(\'td\') || node.parentElement?.parentElement || node.parentElement || node'
                )
                card = handle.as_element() if hasattr(handle, "as_element") else None
                if card:
                    cards.append(card)
            cards = cards[:max_jobs]
        if not cards:
            if _is_challenge_page():
                logger.warning("Indeed: no job cards (page is Cloudflare/Indeed security challenge).")
            else:
                logger.warning(
                    "Indeed: no job cards found (page may have changed, require consent, or block automation)."
                )
            try:
                html = page.content()
                debug_path = _DEBUG_DIR / "indeed_debug.html"
                debug_path.write_text(html, encoding="utf-8")
                logger.info("Indeed: saved page HTML to %s for inspection", debug_path)
            except Exception as e:
                logger.warning("Indeed: could not save debug HTML: %s", e)
        for card in cards[:max_jobs]:
            link_el = (
                card.query_selector('a[data-tn-element="jobTitle"]')
                or card.query_selector("h2.jobTitle a")
                or card.query_selector(".jobsearch-JobInfoHeader-title a")
                or card.query_selector("h2 a[href*='jk=']")
                or card.query_selector("a[data-jk]")
                or card.query_selector('a[href*="viewjob"], a[href*="/rc/"], a[href*="jk="]')
            )
            title_el = link_el
            company_el = (
                card.query_selector('span[itemprop="name"]')
                or card.query_selector('[data-testid="company-name"]')
                or card.query_selector(".companyName")
                or card.query_selector(".jobsearch-CompanyInfoContainer .companyName")
                or card.query_selector("[class*='companyName']")
                or card.query_selector("[class*='company-name']")
            )
            loc_el = (
                card.query_selector(".companyLocation")
                or card.query_selector(".jobsearch-CompanyLocation")
                or card.query_selector("[class*='companyLocation']")
                or card.query_selector("[class*='location']")
            )
            title = (title_el.inner_text() if title_el else "").strip()
            company = (company_el.inner_text() if company_el else "").strip()
            location = (loc_el.inner_text() if loc_el else "").strip()
            if company and location.startswith(company):
                location = location[len(company) :].lstrip("\n ").strip() or location
            href = link_el.get_attribute("href") if link_el else ""
            job_url = (
                f"https://www.indeed.com{href}"
                if href and href.startswith("/")
                else (href or "")
            )
            if job_url and any(f"jk={jid}" in job_url for jid in _FAKE_JOB_IDS):
                continue
            if not title and link_el:
                title = (link_el.inner_text() or "").strip() or "Job"
            if title or company or job_url:
                scraped.append(
                    {
                        "title": (title or "Job")[:500],
                        "company": (company or "Company")[:500],
                        "location": location[:300] if location else "",
                        "source_url": job_url[:2000] if job_url else None,
                    }
                )
        context.close()
        browser.close()
    return scraped
