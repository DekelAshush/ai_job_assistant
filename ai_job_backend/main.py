"""
FastAPI app: single entrypoint. Run with: python main.py
"""
import logging
import os
import sys
import asyncio

from dotenv import load_dotenv

# Show INFO logs from our app (e.g. "Successfully overwrote and updated data for job ...")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from api.routes import health, data

# Force Windows-specific event loop policy for Playwright
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

load_dotenv()
APP_PORT = int(os.getenv("PORT", "8000"))

app = FastAPI(title="AI Job Application Assistant")
app.include_router(health.router)
app.include_router(data.router)

# Allow frontend origin(s): localhost for dev, and FRONTEND_URL for production
_frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if _frontend_url and _frontend_url not in _origins:
    _origins.append(_frontend_url)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

if __name__ == "__main__":
    use_reload = os.getenv("RELOAD", "").lower() in ("1", "true", "yes")
    uvicorn.run("main:app", host="0.0.0.0", port=APP_PORT, reload=use_reload)
