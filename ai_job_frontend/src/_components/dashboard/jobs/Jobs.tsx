"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { JobListing } from "@/types/jobs";
import JobCardList from "./JobCardList";
import JobDisplay from "./JobDisplay";
import { supabaseClient } from "@/_lib/supabaseClient";
import { getScrapeStatus, postAnalyzeMyJobs, postScrapeMyJobs } from "@/_lib/backendApi";

type Props = {
  initialJobs: JobListing[];
  hasResume?: boolean;
};

/** Poll every 2s so the UI updates soon after the backend sets status to "finished". */
const POLL_INTERVAL_MS = 2000;
/** Pipeline can take several minutes (multi-source scrape). Poll long enough to finish. */
const POLL_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const JOBS_PER_PAGE = 5;

export default function Jobs({ initialJobs, hasResume = false }: Props) {
  const [jobs, setJobs] = useState<JobListing[]>(initialJobs);
  const [selectedId, setSelectedId] = useState<string>(initialJobs[0]?.id ?? "");
  const [currentPage, setCurrentPage] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [relevantError, setRelevantError] = useState<string | null>(null);
  const cancelledRef = useRef(false);
  const scoreRefreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPages = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));
  const jobsOnPage = useMemo(
    () => jobs.slice(currentPage * JOBS_PER_PAGE, (currentPage + 1) * JOBS_PER_PAGE),
    [jobs, currentPage]
  );
  const startItem = currentPage * JOBS_PER_PAGE + 1;
  const endItem = Math.min((currentPage + 1) * JOBS_PER_PAGE, jobs.length);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (scoreRefreshIntervalRef.current) {
        clearInterval(scoreRefreshIntervalRef.current);
        scoreRefreshIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (currentPage >= totalPages) setCurrentPage(Math.max(0, totalPages - 1));
  }, [jobs.length, totalPages, currentPage]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedId) ?? jobs[0],
    [jobs, selectedId]
  );

  const handleMarkSaved = (updated: JobListing) => {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? { ...j, status: updated.status } : j)));
  };

  const handleMarkApplied = (updated: JobListing) => {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? { ...j, status: updated.status, applied_at: updated.applied_at } : j)));
  };

  const goToPage = (page: number) => {
    const safe = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(safe);
    const firstOnPage = jobs[safe * JOBS_PER_PAGE];
    if (firstOnPage) setSelectedId(firstOnPage.id);
  };

  const fetchJobsFromDb = async (userId: string) => {
    const { data: list } = await supabaseClient
      .from("jobs")
      .select("id, user_id, title, company, location, work_mode, source_url, description, salary_range, ai_analysis, status, applied_at, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (list?.length) {
      const mapped = (list as JobListing[]).map((j) => ({
        ...j,
        ai_analysis: (j as { ai_analysis?: { match_score?: number | null } }).ai_analysis ?? (j as JobListing).ai_analysis,
      }));
      setJobs(mapped);
      setSelectedId((prev) => (mapped.some((j) => j.id === prev) ? prev : mapped[0]?.id ?? ""));
    } else {
      setJobs([]);
      setSelectedId("");
    }
  };

  const handleGetRelevantJobs = async () => {
    if (!hasResume) {
      setRelevantError("Upload a resume in your profile first to use this feature.");
      return;
    }
    cancelledRef.current = false;
    setRelevantError(null);
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session?.access_token) {
        setRelevantError("Please sign in again.");
        return;
      }
      await postScrapeMyJobs(session.access_token);
      setIsSyncing(true);
      const start = Date.now();
      let idleCount = 0;
      const poll = async (): Promise<void> => {
        if (cancelledRef.current) {
          setIsSyncing(false);
          return;
        }
        if (Date.now() - start >= POLL_TIMEOUT_MS) {
          setRelevantError("Scraping is taking longer than expected. Try again in a moment.");
          setIsSyncing(false);
          return;
        }
        const statusRes = await getScrapeStatus(session.access_token);
        if (cancelledRef.current) {
          setIsSyncing(false);
          return;
        }
        if (statusRes.status === "failed") {
          setRelevantError("Scraping failed. No jobs could be loaded (e.g. the job site may have blocked the request). Try again later.");
          if (!cancelledRef.current) await fetchJobsFromDb(session.user.id);
          setIsSyncing(false);
          return;
        }
        if (statusRes.status === "finished") {
          // Fetch the jobs from the database
          if (!cancelledRef.current) await fetchJobsFromDb(session.user.id);
          setIsSyncing(false);
          if (!cancelledRef.current) {
            // Analyze the jobs using AI
            postAnalyzeMyJobs(session.access_token).catch(() => {});
            // Refresh the scores every 10 seconds
            let scoreRefreshes = 0;
            scoreRefreshIntervalRef.current = setInterval(async () => {
              scoreRefreshes++;
              if (cancelledRef.current || scoreRefreshes > 6) {
                if (scoreRefreshIntervalRef.current) {
                  clearInterval(scoreRefreshIntervalRef.current);
                  scoreRefreshIntervalRef.current = null;
                }
                return;
              }
              // Fetch the jobs from the database
              await fetchJobsFromDb(session.user.id);
            }, 10000);
          }
          return;
        }
        // If the status is idle, increment the idle count and check if it has been idle for 3 seconds
        if (statusRes.status === "idle") {
          idleCount += 1;
          // If the idle count is greater than or equal to 3, set the relevant error and set the syncing to false
          if (idleCount >= 3) {
            setRelevantError("Scrape status was reset. Click the button again to start a new scrape.");
            setIsSyncing(false);
            return;
          }
        } else {
          // If the status is not idle, reset the idle count
          idleCount = 0;
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (cancelledRef.current) {
          setIsSyncing(false);
          return;
        } 
        return poll();
      };
      poll();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to scrape or load jobs.";
      if (!cancelledRef.current) {
        setRelevantError(message);
        console.error("[Get relevant jobs]", e);
      }
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-20 py-8 space-y-6">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">Search All Jobs</h1>
              {isSyncing && (
                <span className="flex items-center gap-1.5 text-sm text-slate-400" aria-live="polite">
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
                  </span>
                  Updating jobs in background…
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300" suppressHydrationWarning>
              <button
                type="button"
                onClick={handleGetRelevantJobs}
                disabled={isSyncing}
                className="px-3 py-1 rounded-lg border border-sky-600 bg-sky-700 text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                suppressHydrationWarning
              >
                {isSyncing ? "Searching…" : "Get relevant jobs"}
              </button>
              <button className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:border-slate-500" suppressHydrationWarning>
                Save Search
              </button>
              <button className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:border-slate-500" suppressHydrationWarning>
                Clear Filters
              </button>
            </div>
          </div>
          {!hasResume && (
            <p className="text-sm text-slate-400">
              Upload a resume in your profile to enable &quot;Get relevant jobs&quot; (match jobs to your resume).
            </p>
          )}
          {relevantError && (
            <p className="text-sm text-red-400">{relevantError}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search for roles, companies, or locations"
              className="w-full md:w-96 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              suppressHydrationWarning
            />
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800 text-slate-200">Location</span>
              <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800 text-slate-200">Job Type</span>
              <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800 text-slate-200">Experience</span>
              <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800 text-slate-200">Category</span>
              <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800 text-slate-200">More filters</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="text-xs text-slate-400">
              {jobs.length === 0
                ? "No jobs"
                : `Showing ${startItem}–${endItem} of ${jobs.length} jobs`}
            </div>
            <JobCardList jobs={jobsOnPage} selectedId={selectedId} onSelect={setSelectedId} />
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700" suppressHydrationWarning>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  suppressHydrationWarning
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400" suppressHydrationWarning>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  suppressHydrationWarning
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <JobDisplay job={selectedJob} onMarkSaved={handleMarkSaved} onMarkApplied={handleMarkApplied} />
          </div>
        </div>
      </div>
    </div>
  );
}
