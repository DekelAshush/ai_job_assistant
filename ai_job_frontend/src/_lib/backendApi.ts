/**
 * API client for scrape, AI analysis, and resume extraction.
 * Pass Supabase access_token (e.g. from supabaseClient.auth.getSession() → session.data.session?.access_token).
 * Set NEXT_PUBLIC_API_URL (e.g. http://localhost:8000) in .env.local.
 */

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

/** POST /data/analyze-my-jobs - starts background AI analysis. Returns 202 with { status: "processing" }. */
export async function postAnalyzeMyJobs(accessToken: string): Promise<{ status: string }> {
  const res = await fetch(`${getBaseUrl()}/data/analyze-my-jobs`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
  if (res.status === 503) throw new Error("AI analysis not configured.");
  if (res.status !== 202) throw new Error(`Analyze jobs: ${res.status}`);
  return res.json();
}

async function apiError(res: Response, prefix: string): Promise<string> {
  let detail = res.statusText;
  try {
    const body = await res.json();
    if (body?.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
  } catch {
    // ignore
  }
  return `${prefix}: ${res.status} ${detail}`;
}

/** POST /data/scrape-my-jobs - starts background scraping based on resume + preferences. Returns 202. */
export async function postScrapeMyJobs(accessToken: string): Promise<{ status: string }> {
  const url = `${getBaseUrl()}/data/scrape-my-jobs`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: authHeaders(accessToken),
    });
  } catch (e) {
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      throw new Error(
        `Cannot reach API at ${url}. Check NEXT_PUBLIC_API_URL in .env.local and that the service is running.`
      );
    }
    throw e;
  }
  if (!res.ok) throw new Error(await apiError(res, "Scrape start failed"));
  if (res.status !== 202) throw new Error(await apiError(res, "Scrape start failed"));
  return res.json();
}

/** POST /data/extract-resume-text - extract text from uploaded resume and save to DB. Call after resume upload. */
export async function postExtractResumeText(accessToken: string): Promise<{ ok: boolean; resume_text_length: number }> {
  const res = await fetch(`${getBaseUrl()}/data/extract-resume-text`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
  if (!res.ok) {
    const msg = await apiError(res, "Resume text extraction failed");
    throw new Error(msg);
  }
  return res.json();
}

/** GET /data/scrape-status - poll until status === 'finished' or 'failed', then fetch jobs or show error. */
export type ScrapeStatusResponse = { status: "idle" | "processing" | "finished" | "failed"; finished_at: string | null };

export async function getScrapeStatus(accessToken: string): Promise<ScrapeStatusResponse> {
  const url = `${getBaseUrl()}/data/scrape-status`;
  let res: Response;
  try {
    res = await fetch(url, { headers: authHeaders(accessToken) });
  } catch (e) {
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      throw new Error(`Cannot reach API at ${url}. Is the service running?`);
    }
    throw e;
  }
  if (!res.ok) throw new Error(await apiError(res, "Scrape status failed"));
  return res.json();
}
