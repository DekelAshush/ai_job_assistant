"""
ZipRecruiter job listing scraper (Playwright).
Returns list of dicts: title, company, location, source_url.
"""
import logging
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

logger = logging.getLogger(__name__)
_DEBUG_DIR = Path(__file__).resolve().parent.parent.parent


def run_ziprecruiter_scrape(
    role_query: str,
    location_query: str,
    *,
    headless: bool = True,
    max_jobs: int = 15,
) -> list[dict[str, Any]]:
    """Scrape ZipRecruiter job listings. Returns same shape as Indeed."""
    role = role_query.replace("+", " ").replace(" ", "-").strip() or "software-engineer"
    location = (location_query or "remote").replace("+", " ")
    scraped: list[dict[str, Any]] = []
    url = f"https://www.ziprecruiter.com/jobs-search?search={role.replace(' ', '+')}&location={location.replace(' ', '+')}"
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
            page.wait_for_timeout(3000)
            for sel in [
                "button >> text=Accept",
                "button >> text=Accept All",
                "[data-consent-accept]",
                "#onetrust-accept-btn-handler",
            ]:
                try:
                    btn = page.query_selector(sel)
                    if btn and btn.is_visible():
                        btn.click()
                        page.wait_for_timeout(1500)
                        break
                except Exception:
                    continue
            page.wait_for_timeout(4000)
            try:
                page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
                page.wait_for_timeout(2000)
            except Exception:
                pass
            # Build listingKey -> canonical URL from embedded JSON (current SERP uses this)
            job_url_by_key: dict[str, str] = {}
            try:
                entries = page.evaluate(
                    """
                    () => {
                        const el = document.getElementById('js_variables');
                        if (!el || !el.textContent) return [];
                        try {
                            const data = JSON.parse(el.textContent);
                            const cards = data.hydrateJobCardsResponse?.jobCards || [];
                            return cards.map(c => ({ key: c.listingKey || '', url: c.rawCanonicalZipJobPageUrl || '' }));
                        } catch (e) { return []; }
                    }
                    """
                )
                base = "https://www.ziprecruiter.com"
                for item in (entries or []):
                    key = (item.get("key") or "").strip()
                    url = (item.get("url") or "").strip()
                    if key and url:
                        job_url_by_key[key] = url if url.startswith("http") else f"{base}{url}"
            except Exception as e:
                logger.debug("ZipRecruiter: could not read job URLs from page JSON: %s", e)
            # Card selectors matching current SERP: article id="job-card-<listingKey>" and wrapper .job_result_two_pane_v2
            cards = page.query_selector_all("article[id^='job-card-']")
            if not cards:
                cards = page.query_selector_all(".job_result_two_pane_v2")
            if not cards:
                cards = page.query_selector_all("[data-job-id], .job_result, .job_content, article[class*='job']")
            if not cards:
                cards = page.query_selector_all("a[href*='/Job/'], a[href*='/job/']")
            if not cards:
                cards = page.query_selector_all("[class*='JobCard'], [class*='job-card']")
            if not cards:
                logger.warning("ZipRecruiter: no job cards found.")
                try:
                    (_DEBUG_DIR / "ziprecruiter_debug.html").write_text(page.content(), encoding="utf-8")
                    logger.info("ZipRecruiter: saved page HTML to ziprecruiter_debug.html")
                except Exception as e:
                    logger.warning("ZipRecruiter: could not save debug HTML: %s", e)
            for card in cards[:max_jobs]:
                try:
                    # Resolve card to the article if we selected the wrapper
                    article = card.query_selector("article[id^='job-card-']") if card.evaluate("el => el.tagName !== 'ARTICLE'") else card
                    if not article:
                        article = card
                    card_id = article.get_attribute("id") or ""
                    listing_key = card_id.replace("job-card-", "", 1) if card_id.startswith("job-card-") else ""
                    job_url = job_url_by_key.get(listing_key) if listing_key else None
                    if not job_url:
                        is_anchor = card.evaluate("el => el.tagName === 'A'")
                        link_el = card if is_anchor else card.query_selector("a[href*='/Job/'], a[href*='/job/'], a[href*='job-redirect']")
                        if not link_el:
                            link_el = card.query_selector("a[href*='ziprecruiter']")
                        if not link_el:
                            link_el = card.query_selector("a")
                        href = link_el.get_attribute("href") if link_el else ""
                        if not href or ("/job" not in href.lower() and "job-redirect" not in href):
                            continue
                        job_url = href if href.startswith("http") else f"https://www.ziprecruiter.com{href}"
                    title_el = article.query_selector("h2, [class*='title'], .job_title")
                    company_el = article.query_selector("[data-testid='job-card-company'], [class*='company'], .company_name")
                    loc_el = article.query_selector("[data-testid='job-card-location'], [class*='location'], .location")
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
                    logger.debug("ZipRecruiter card parse skip: %s", e)
                    continue
        except Exception as e:
            logger.warning("ZipRecruiter scrape failed: %s", e)
        context.close()
        browser.close()
    return scraped
