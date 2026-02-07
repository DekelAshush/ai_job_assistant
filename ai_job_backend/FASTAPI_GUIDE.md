# FastAPI – How to Use It & What Each Folder Is For

This is a short guide to **FastAPI** and how your **ai_job_backend** project is organized.

---

## What is FastAPI?

**FastAPI** is a Python web framework for building **APIs** (HTTP endpoints). Your frontend (Next.js) calls these endpoints to get or send data.

- You define **routes** (URLs + HTTP methods like GET, POST).
- FastAPI handles **validation** (e.g. request body shape), **docs** (Swagger UI at `/docs`), and **async** support.
- You run the app with **Uvicorn** (ASGI server).

### How to run your backend (WSL)

From the **ai_job_backend** folder in WSL:

```bash
pip install -r requirements.txt
playwright install
sudo python3 -m playwright install-deps   # system libs for Chromium (first time)

python main.py
# Or: uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Then open:

- **API:** http://localhost:8000  
- **Interactive docs (Swagger):** http://localhost:8000/docs
- **Health check example:** http://localhost:8000/health

---

## Project structure – what each folder is for

```
ai_job_backend/
├── main.py              # Entry point: runs the app
├── requirements.txt     # Python dependencies
├── .env                 # Secrets (DB URL, API keys) – not committed
└── api/
    ├── main.py          # FastAPI app: creates app, mounts routes, CORS, DB init
    ├── database/        # How we connect to the database
    ├── dependencies/    # Reusable “injection” (e.g. DB session)
    ├── models/          # Database tables (SQLAlchemy ORM)
    ├── schemas/         # Request/response shapes (Pydantic)
    ├── routes/          # API endpoints (URLs + logic)
    └── services/        # (Optional) Business logic used by routes
```

---

### Root: `main.py`

- **Role:** Entry point when you run `python main.py`.
- **What it does:** Defines the FastAPI `app` and runs it with Uvicorn (host, port, reload).
- **You use it:** To start the server; you rarely edit this.

---

### `api/main.py`

- **Role:** Where the **FastAPI application** is created and configured.
- **What it does:**
  - Creates `app = FastAPI(...)`.
  - Registers **routers** from `api.routes` (e.g. `jobs.router`, `health.router`).
  - Adds **CORS** so the frontend (e.g. localhost:3000) can call the API.
  - Calls `models.Base.metadata.create_all(bind=engine)` to create DB tables on startup.
- **You use it:** To add new route modules (`app.include_router(...)`) or change CORS/middleware.

---

### `api/database/`

- **Role:** Everything about **connecting to the database** (PostgreSQL).
- **What’s inside:**  
  - `engine` – SQLAlchemy engine (connection to PostgreSQL).  
  - `SessionLocal` – factory for creating a **session** per request.  
  - `Base` – base class for all **models** (tables).
- **You use it:** When you define new tables in `models/` (they inherit `Base`) and when you need a DB session (usually via `dependencies`).

---

### `api/models/`

- **Role:** **Database tables** defined with SQLAlchemy (ORM).
- **What’s inside:** Python classes that map to tables (e.g. `Job` → table `jobs`). Each attribute is a column (`id`, `title`, `company`, etc.).
- **You use it:** When you add or change tables/columns. Routes and services use these classes to read/write the DB (e.g. `db.query(Job).filter(...)`).

---

### `api/schemas/`

- **Role:** **Request and response shapes** (validation + API contract) using Pydantic.
- **What’s inside:** Classes like `JobAnalysisRequest` (what the client sends) and `JobAnalysisResponse` (what the API returns). FastAPI uses these to validate JSON and generate docs.
- **You use it:** When you add a new endpoint – define a schema for the body/response and use it in the route (e.g. `payload: JobAnalysisRequest`, `response_model=JobAnalysisResponse`).

---

### `api/routes/`

- **Role:** **API endpoints** – the URLs and HTTP methods your frontend calls.
- **What’s inside:**  
  - One file per “resource” or area (e.g. `health.py`, `jobs.py`).  
  - Each file defines an `APIRouter()` and **route functions** with decorators like `@router.get("/health")`, `@router.post("/analyze")`.  
  - Route functions receive **dependencies** (e.g. `db: db_dependency`) and return data (or raise HTTPException).
- **You use it:** To add or change endpoints. This is where you connect “URL + method” to “what the backend does”.

---

### `api/dependencies/`

- **Role:** **Reusable pieces** that FastAPI “injects” into route functions (e.g. a DB session per request).
- **What’s inside:**  
  - `get_db()` – yields a DB session; ensures it’s closed after the request.  
  - `db_dependency` – shorthand so you can write `db: db_dependency` in a route and get that session.
- **You use it:** When you want every request (or a group of routes) to get the same thing (DB session, current user, etc.) without repeating code.

---

### `api/services/`

- **Role:** (Optional) **Business logic** that doesn’t belong in routes – e.g. calling external APIs, complex calculations.
- **You use it:** When a route gets long or you want to reuse logic in several routes; move that logic into a function or class in `services/` and call it from the route.

---

## How a request flows (example: POST /jobs/analyze)

1. **Request** – Frontend sends `POST /jobs/analyze` with body `{ "url": "https://..." }`.
2. **Route** – FastAPI matches the URL to a function in `api/routes/jobs.py` (e.g. `analyze_job`).
3. **Dependencies** – FastAPI runs `get_db()` and injects a **DB session** into the function (e.g. `db: db_dependency`).
4. **Validation** – The body is validated against `JobAnalysisRequest` (from `api/schemas/`); if invalid, FastAPI returns 422.
5. **Logic** – The route uses `db` and the payload (e.g. scrape URL, call AI, create a `Job` from `api/models/`).
6. **Response** – The return value is validated against `JobAnalysisResponse` and sent as JSON.

---

## Quick reference

| I want to…                    | Where to do it        |
|------------------------------|------------------------|
| Add a new URL/endpoint       | `api/routes/` (new or existing file) |
| Change the shape of request/response | `api/schemas/`        |
| Add or change a DB table     | `api/models/`         |
| Reuse something in many routes (e.g. DB) | `api/dependencies/`   |
| Configure DB connection     | `api/database/`       |
| Configure app, CORS, routers | `api/main.py`         |
| Run the server               | `python main.py` from project root   |

---

## Docs and learning

- **Your app’s docs:** http://localhost:8000/docs (try endpoints from the browser).
- **FastAPI docs:** https://fastapi.tiangolo.com/

Once you’re comfortable with “route → dependency → model/schema”, you can extend the backend by adding routes, schemas, and models in the folders above.
