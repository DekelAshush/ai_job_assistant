"""
Test the AI job analysis (get_ai_analysis) outside of the server and measure time.

Usage (from ai_job_backend):
  # Sample description only (no Indeed):
  python scripts/test_ai_analysis.py [profile_text]

  # Fetch from Indeed, then run AI on each job (DB-like array -> AI):
  python scripts/test_ai_analysis.py --scrape [--role "software engineer"] [--location remote] [profile_text]

Loads .env from backend root; requires AZURE_DEEPSEEK_API_KEY. For --scrape, Playwright must be installed.
"""
import json
import os
import sys
import time

_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(_backend_root, ".env"))
except ImportError:
    pass

from api.services.job_analysis import get_openai_client, get_ai_analysis, DEFAULT_PROFILE

SAMPLE_JOB_DESCRIPTION = """
Senior Full-Stack Developer

We are looking for a Full-Stack Developer to join our team in Washington D.C.
You will work with React, Node.js, and PostgreSQL. Remote-friendly.

Requirements:
- 2+ years experience with JavaScript/TypeScript
- Experience with React and Node.js
- Familiarity with REST APIs and databases
- CS degree or equivalent experience preferred

Nice to have: Python, cloud (AWS/GCP), CI/CD.
"""


def fetch_indeed_to_db_like(role: str = "software engineer", location: str = "remote", max_jobs: int = 5):
    """
    Fetch jobs from multiple sources (Indeed first, then ZipRecruiter/Glassdoor/LinkedIn if < 15).
    Fetches full description for each job via fetch_job_page_content. Return list of dicts.
    """
    from api.services.description_enricher import fetch_job_page_content
    from api.services.job_scrapers import run_multi_source_scrape

    print("Fetching job list (Indeed + ZipRecruiter/Glassdoor/LinkedIn if needed)...")
    raw = run_multi_source_scrape(
        role, location, headless=True, min_jobs=15, max_jobs=max(max_jobs, 15)
    )
    jobs_db_like = []
    for item in raw:
        jobs_db_like.append({
            "title": item.get("title") or "Job",
            "company": item.get("company") or "Company",
            "location": item.get("location") or "",
            "source_url": item.get("source_url"),
            "description": "",
        })
    if not jobs_db_like:
        return jobs_db_like
    print("Fetching descriptions per job...")
    for job in jobs_db_like:
        url = job.get("source_url")
        if url:
            job["description"] = fetch_job_page_content(url, headless=True, max_chars=15000) or ""
    return jobs_db_like


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    use_scrape = "--scrape" in sys.argv
    role = "software engineer"
    location = "remote"
    if "--role" in sys.argv:
        i = sys.argv.index("--role")
        if i + 1 < len(sys.argv):
            role = sys.argv[i + 1]
    if "--location" in sys.argv:
        i = sys.argv.index("--location")
        if i + 1 < len(sys.argv):
            location = sys.argv[i + 1]
    profile = (args[0].strip() if args else None) or DEFAULT_PROFILE

    print("Profile:", profile[:200] + "..." if len(profile) > 200 else profile)
    print()

    try:
        client = get_openai_client()
    except Exception as e:
        print("Error: Could not create OpenAI client.", e, file=sys.stderr)
        return 1

    if use_scrape:
        jobs_db_like = fetch_indeed_to_db_like(role=role, location=location, max_jobs=5)
        if not jobs_db_like:
            print("No jobs fetched from Indeed.", file=sys.stderr)
            return 1
        print(f"Fetched {len(jobs_db_like)} jobs (DB-like array). Running AI analysis on each...")
        print("-" * 60)
        total_start = time.perf_counter()
        for i, job in enumerate(jobs_db_like):
            desc = (job.get("description") or "")[:12000]
            title = job.get("title", "?")
            print(f"[{i + 1}/{len(jobs_db_like)}] {title[:50]}...")
            t0 = time.perf_counter()
            analysis = get_ai_analysis(desc or "No description.", profile, client)
            elapsed = time.perf_counter() - t0
            job["match_score"] = analysis.get("match_score", 50)
            job["ai_analysis"] = {"match_score": job["match_score"]}  # single source; DB may store both columns
            print(f"  match_score={job['match_score']}  time={elapsed:.2f}s")
        total_elapsed = time.perf_counter() - total_start
        print("-" * 60)
        print(f"Total: {len(jobs_db_like)} jobs in {total_elapsed:.2f}s (avg {total_elapsed / len(jobs_db_like):.2f}s per job)")
        print()
        print("All jobs have ai_analysis and match_score attached:")
        for i, j in enumerate(jobs_db_like):
            print(f"  {i+1}. {j.get('title', '?')[:45]}  score={j.get('match_score')}  description={len(j.get('description') or '')} chars")
        print()
        print("Full DB-like result (first job only; description length only):")
        first = dict(jobs_db_like[0])
        first["description"] = "[%d chars]" % len(first.get("description") or "")
        # Single match_score (no duplicate inside ai_analysis in output)
        first["match_score"] = first.get("match_score")
        first["ai_analysis"] = "(same match_score)"
        print(json.dumps(first, indent=2, ensure_ascii=False))
        return 0

    # Original path: sample description only
    print("Job description length:", len(SAMPLE_JOB_DESCRIPTION), "chars")
    print("-" * 60)
    start = time.perf_counter()
    result = get_ai_analysis(SAMPLE_JOB_DESCRIPTION, profile, client)
    elapsed = time.perf_counter() - start
    print("Result (JSON):")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print()
    print(f"Time: {elapsed:.2f}s")
    n = 5
    print()
    print(f"Running {n} analyses (same input)...")
    times = []
    for i in range(n):
        t0 = time.perf_counter()
        get_ai_analysis(SAMPLE_JOB_DESCRIPTION, profile, client)
        times.append(time.perf_counter() - t0)
        print(f"  Run {i + 1}: {times[-1]:.2f}s")
    print(f"Average: {sum(times) / len(times):.2f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
