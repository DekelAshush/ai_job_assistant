# AI-Powered Job Application Assistant

A full-stack job search app: scrape jobs from multiple sites, score them with AI, and track applications. Frontend (Next.js) talks to Supabase for auth and data; a FastAPI backend handles scraping (Playwright) and AI analysis.

## Project structure

- **`ai_job_frontend/`** — Next.js 16, TypeScript, Tailwind. Auth and data via Supabase; backend API for scrape, AI analysis, and resume extraction.
- **`ai_job_backend/`** — FastAPI. Scrapes Indeed, ZipRecruiter, Glassdoor, LinkedIn; AI scoring (DeepSeek); resume text extraction. Uses Supabase for DB and JWT auth.

## Frontend (Next.js / TypeScript / Tailwind)

- **`src/app/(main)/`** — Landing, About.
- **`src/app/auth/`** — Login, Register, OAuth callback (Supabase).
- **`src/app/(onboarding)/preferences/`** — Onboarding flow (roles, location, skills, etc.).
- **`src/app/(dashboard)/`** — Dashboard, Jobs, Matches, Job Tracker, Profile, Documents.
- **`src/app/api/`** — Next.js API routes (onboarding, profile-sync).
- **`src/_components/`** — UI: layout, dashboard (jobs, matches, jobTracker, profile), navigation, onboarding.
- **`src/_lib/`** — Supabase client, backend API client (scrape, analyze, extract resume), server Supabase.
- **`src/types/`** — TypeScript types for jobs, profile, app.

### Notes

- Auth is Supabase (email/password + Google/LinkedIn OAuth). Session is in cookies; middleware protects routes.
- Jobs and profile data are read/written in Supabase from the frontend; the backend is used for “Get relevant jobs” (scrape), “Analyze my jobs” (AI), and resume text extraction.

## Backend (FastAPI / Supabase / Playwright)

- **`main.py`** — FastAPI app, CORS, routers (health, data). Run with `uvicorn main:app --reload` or `python main.py`.
- **`api/routes/`** — `health`: liveness; `data`: scrape-my-jobs, scrape-status, analyze-my-jobs, extract-resume-text, etc. All data routes require a valid Supabase JWT.
- **`api/dependencies/auth.py`** — Verifies Supabase JWT (ES256 or HS256), returns `user_id`.
- **`api/services/`** — `job_scrapers.py` (multi-source scrape), `job_analysis.py` (AI scoring), `resume_extractor.py`, `description_enricher.py`, `supabase_client.py`; **`scrapers/`** — Indeed, ZipRecruiter, Glassdoor, LinkedIn (Playwright).

### Notes

- No local Postgres: backend uses **Supabase** (service role) for jobs and user preferences.
- Scraping uses **Playwright** (Chromium). For production, the app is intended to run in **Docker** using the official Playwright Python image (see `ai_job_backend/Dockerfile` and `render.yaml`).

## Environment

**Frontend (e.g. `.env.local`):**

- `NEXT_PUBLIC_API_URL` — Backend API base URL (e.g. `http://localhost:8000` or your Render backend URL).
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project (auth + DB from the client).

**Backend (e.g. `.env`):**

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase project (backend DB and auth verification).
- `SUPABASE_JWT_SECRET` or JWKS (ES256) — For verifying Supabase JWTs.
- `AZURE_DEEPSEEK_API_KEY` (and endpoint if needed) — For AI job scoring.
- `FRONTEND_URL` — Allowed CORS origin for the frontend.

## Running locally

```bash
# Backend
cd ai_job_backend
pip install -r requirements.txt
playwright install chromium
# On Linux/WSL you may need: sudo playwright install-deps
python main.py
# or: uvicorn main:app --reload

# Frontend
cd ai_job_frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to your backend URL (e.g. `http://localhost:8000`).

## Deployment

- **Backend (Render):** Use **Docker**. Root directory: `ai_job_backend`. The repo’s `ai_job_backend/render.yaml` and `Dockerfile` use the Playwright Python image so Chromium is available. Set env vars (Supabase, DeepSeek, FRONTEND_URL) in the Render dashboard.
- **Frontend (e.g. Vercel):** Set `NEXT_PUBLIC_API_URL` to your deployed backend URL and configure Supabase redirect URLs for production.

## Features

- **Auth** — Sign up / sign in with email or Google/LinkedIn via Supabase.
- **Onboarding** — Preferences (roles, location, skills, work type, etc.) stored in Supabase.
- **Jobs** — “Get relevant jobs” triggers backend scrape (multi-source); jobs are saved to Supabase and shown in the dashboard.
- **Matches** — High match-score jobs; AI analysis can be run from the backend.
- **Job Tracker** — Columns: Saved, Applied, Interviewing, Offer, Rejected; status updated in Supabase.
- **Profile & Documents** — Profile and resume upload; backend extracts text from the resume for matching.
