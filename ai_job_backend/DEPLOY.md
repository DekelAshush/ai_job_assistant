# Deploy backend to Render

1. **Connect repo** to Render and create a **Web Service** from the `ai_job_backend` directory (or use the root and set root to `ai_job_backend`). If you have `render.yaml` in the backend folder, use it as the blueprint.

2. **Environment variables** (set in Render dashboard → Service → Environment):
   - `SUPABASE_URL` – your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key (backend only)
   - `FRONTEND_URL` – your frontend URL (e.g. `https://your-app.onrender.com`) so CORS allows it
   - `AZURE_DEEPSEEK_API_KEY` – (optional) for AI job analysis; if missing, scrape works but “analyze” returns 503
   - `AZURE_DEEPSEEK_ENDPOINT` – (optional) Azure DeepSeek endpoint URL if using Azure

3. **Build** runs: `pip install -r requirements.txt` and `playwright install chromium` (+ deps). **Start** runs: `uvicorn main:app --host 0.0.0.0 --port $PORT`. Render sets `PORT` automatically.

4. **Frontend**: set `NEXT_PUBLIC_API_URL` to your Render backend URL (e.g. `https://ai-job-backend.onrender.com`).
