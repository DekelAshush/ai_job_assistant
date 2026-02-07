# Start from 0 – Backend (No Database)

This backend **does not use a database**. The frontend talks to **Supabase** for all data. The backend only **scrapes job URLs and runs AI analysis**, then returns the result so the frontend can save it to Supabase.

---

## What you have

```
ai_job_backend/
├── main.py              ← Entry point: run `python main.py` to start the server
├── requirements.txt     ← Python packages (FastAPI, uvicorn, openai, playwright, …)
├── .env                 ← Secrets (AZURE_DEEPSEEK_*, FRONTEND_URL, PORT)
└── api/
    ├── main.py          ← Creates FastAPI app, mounts routes, CORS (no DB)
    ├── routes/          ← API endpoints
    │   ├── health.py    ← GET /health
    │   └── jobs.py     ← GET /jobs/health, POST /jobs/analyze
    ├── schemas/         ← Request/response shapes (JobAnalysisRequest, JobAnalysisResponse)
    └── services/        ← (Optional) extra business logic
```

**Flow:**

1. Frontend updates Supabase (e.g. creates/updates a job row).
2. Frontend calls **POST /jobs/analyze** with `{ "url": "https://..." }`.
3. Backend scrapes the URL, runs AI analysis, returns `{ "analysis", "title", "company", "url" }`.
4. Frontend saves that analysis (and any fields) to Supabase.

---

## How to run (WSL)

From **ai_job_backend** in WSL:

```bash
pip install -r requirements.txt
playwright install
sudo python3 -m playwright install-deps   # system libs for Chromium
python main.py
```

Then open **http://localhost:8000/docs** and try:

- **GET /health** – health check
- **POST /jobs/analyze** – body `{ "url": "https://example.com" }` → returns AI analysis + title, company, url

No PostgreSQL or `.env` DB vars are needed for this backend.
