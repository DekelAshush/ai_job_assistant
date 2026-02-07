"""
Test the Indeed scraper without frontend or Supabase. Just prints results.
Usage (from ai_job_backend): python scripts/test_scrape.py [role] [location]
Example: python scripts/test_scrape.py "software engineer" remote
"""
import json
import os
import sys
from typing import Any

_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

from api.services.scrapers.indeed_scraper import run_indeed_scrape


def scrape_indeed(
    role_query: str = "software+engineer",
    location_query: str = "remote",
    debug: bool = False,
) -> list[dict[str, Any]]:
    """Thin wrapper: uses shared scraper. HEADED=1 runs visible browser."""
    headed = os.getenv("HEADED", "").lower() in ("1", "true", "yes")
    results = run_indeed_scrape(
        role_query,
        location_query,
        headless=not headed,
        max_jobs=15,
    )
    if debug:
        print(f"Debug: {len(results)} jobs (same logic as backend)", file=sys.stderr)
    return results


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--debug"]
    debug = "--debug" in sys.argv
    role = args[0] if args else "software engineer"
    location = args[1] if len(args) > 1 else "remote"
    print(f"Scraping Indeed: q={role!r} l={location!r}")
    print("-" * 60)
    try:
        results = scrape_indeed(role, location, debug=debug)
        print(f"Found {len(results)} jobs:\n")
        if results:
            print(json.dumps(results, indent=2, ensure_ascii=False))
        else:
            print("[]")
            print("\nTip: If you see 'Just a moment...', Indeed is blocking headless. Try: $env:HEADED=1; python scripts/test_scrape.py", file=sys.stderr)
            print("Or use --debug / SAVE_HTML=1 to inspect.", file=sys.stderr)
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
