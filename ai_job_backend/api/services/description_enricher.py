"""
Enrich scraped jobs with full description text by visiting each source_url.
Source-agnostic: works for Indeed, ZipRecruiter, LinkedIn, etc.
Scrapers only scrape listing pages; this step fetches the job page and extracts description.
"""
import logging
from playwright.sync_api import sync_playwright

logger = logging.getLogger(__name__)

# Selectors to try for job description text (source-agnostic). First match wins.
_DESCRIPTION_SELECTORS = [
    "#jobDescriptionText",  # Indeed
    ".jobsearch-JobComponent-description",
    ".jobsearch-jobDescriptionText",
    ".job-description",
    ".description",
    "[class*='job-description']",
    "[class*='jobDescription']",
    "[class*='JobDescription']",
    ".jobs-details__content",  # LinkedIn
    "[data-job-description]",
    "main",
    "article",
]


def fetch_job_page_content(
    url: str,
    *,
    headless: bool = True,
    max_chars: int = 50000,
) -> str:
    """
    Fetch a single job page by URL and return extracted description text (or raw body if extraction fails).
    Uses Playwright. Returns empty string on failure.
    """
    if not (url or url.strip()):
        return ""
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
            page.goto(url, wait_until="domcontentloaded", timeout=15000)
            if "indeed.com" in url:
                try:
                    page.wait_for_selector("#jobDescriptionText", timeout=10000)
                except Exception:
                    pass
            else:
                page.wait_for_timeout(2000)
            description = ""
            for selector in _DESCRIPTION_SELECTORS:
                try:
                    el = page.query_selector(selector)
                    if el:
                        text = (el.inner_text() or "").strip()
                        if len(text) > len(description) and len(text) >= 50:
                            description = text[:max_chars]
                except Exception:
                    continue
            if description:
                context.close()
                browser.close()
                return description
            # Fallback: use body text
            try:
                body = page.query_selector("body")
                if body:
                    description = (body.inner_text() or "").strip()[:max_chars]
            except Exception:
                pass
            context.close()
            browser.close()
            return description or ""
        except Exception as e:
            logger.warning("fetch_job_page_content failed for %s: %s", url[:80], e)
            context.close()
            browser.close()
            return ""
