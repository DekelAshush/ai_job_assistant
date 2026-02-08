# AI-Powered Job Application Assistant (Starter)

Production-ready starter for a Simplify Copilot–inspired web app. Clean separation between frontend (Next.js) and backend (FastAPI) with room for AI agents, auth, and dashboards.

## Frontend (Next.js / TypeScript / Tailwind)
- `src/app/(auth)`: Auth surface (JWT wiring pending).
- `src/app/dashboard|applications|resume|profile`: Dashboard-first pages for the four pillars.
- `src/components/layout`: `AppShell` + `Sidebar` keep navigation consistent.
- `src/components/ui`: Reusable UI primitives (start with `Card`).
- `src/services`: API client helpers (centralize base URL/env).
- `src/lib`: Shared constants/utilities.
- `src/types`: Shared TypeScript models for API contracts.

### Notes
- App Router, typed pages, and Tailwind for rapid SaaS UI iteration.
- Sidebar-first layout mirrors simplify.jobs/copilot UX philosophy.
- Wire API calls through `services/apiClient` to keep fetch logic centralized.

## Backend (FastAPI / PostgreSQL)
- `main.py`: FastAPI app, CORS, router registration (single entrypoint).
- `api/routes`: HTTP surface (`auth`, `jobs`, `health`). Keep routes thin.
- `api/dependencies`: Shared FastAPI dependencies (DB session, auth guards).
- `api/database`: Engine + session factory; env-driven Postgres URL.
- `api/models`: ORM models (`User`, `Job`) on shared `Base`.
- `api/schemas`: Pydantic request/response contracts.
- `api/services`: Business/AI layer placeholder—keep heavy logic out of routes.
- Run backend with `python main.py` or `uvicorn main:app --reload`.

### Notes
- JWT-ready auth scaffold using `python-jose` and `passlib[bcrypt]`.
- Clear lane for AI logic via `api/services` so routes stay composable/testable.
- `render.yaml` configured to serve `main:app` on Render.

## Environment
- Frontend: `NEXT_PUBLIC_API_URL` points to FastAPI base URL.
- Backend: `PG_*` vars for Postgres, `AUTH_SECRET_KEY`, `AUTH_ALGORITHM`, and any AI provider keys.

## Running locally
```bash
# Backend
cd ai_job_backend
pip install -r requirements.txt
python main.py
# or: uvicorn main:app --reload

# Frontend
cd ai_job_frontend
npm install
npm run dev
```

## Future hooks
- Autofill Agent: store profile data and surface in applications.
- Resume↔JD Scoring: service layer in `api/services` + UI in `resume/`.
- Tailored Answers: connect to AI provider; render in `applications/`.
- Tracking Dashboard: persist app states in Postgres; display in `dashboard/`.
