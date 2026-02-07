"use client";

import { useEffect, useMemo, useState } from "react";
import { JobListing } from "@/types/jobs";
import JobCardList from "./JobCardList";
import JobDisplay from "./JobDisplay";
import { supabaseClient } from "@/_lib/supabaseClient";

const MIN_MATCH_SCORE = 80;
const JOBS_COLUMNS =
  "id, user_id, title, company, location, work_mode, source_url, description, salary_range, ai_analysis, status, applied_at, created_at, updated_at";

type Props = {
  initialMatches: JobListing[];
};

function filterHighMatches(jobs: unknown[]): JobListing[] {
  return (jobs as JobListing[]).filter((j) => {
    const score = j.ai_analysis?.match_score;
    return score != null && score >= MIN_MATCH_SCORE;
  });
}

export default function MatchesWrapper({ initialMatches }: Props) {
  const [matches, setMatches] = useState<JobListing[]>(initialMatches);
  const [selectedId, setSelectedId] = useState<string>(initialMatches[0]?.id ?? "");

  useEffect(() => {
    const refetch = async () => {
      const { data } = await supabaseClient.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return;
      const { data: jobsData } = await supabaseClient
        .from("jobs")
        .select(JOBS_COLUMNS)
        .eq("user_id", uid)
        .order("updated_at", { ascending: false })
        .limit(100);
      const high = filterHighMatches(jobsData ?? []);
      setMatches(high);
      setSelectedId((prev) => (high.some((j) => j.id === prev) ? prev : high[0]?.id ?? ""));
    };
    refetch();
  }, []);

  const selectedJob = useMemo(
    () => matches.find((j) => j.id === selectedId) ?? matches[0],
    [matches, selectedId]
  );

  const handleMarkApplied = (updated: JobListing) => {
    setMatches((prev) => prev.map((j) => (j.id === updated.id ? { ...j, status: updated.status, applied_at: updated.applied_at } : j)));
  };

  const handleMarkSaved = (updated: JobListing) => {
    setMatches((prev) => prev.map((j) => (j.id === updated.id ? { ...j, status: updated.status } : j)));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-20 py-8 space-y-6">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl font-semibold">Best Matches</h1>
            <div className="text-sm text-slate-400">Jobs with match score 80+ (AI-ranked from your profile)</div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="text-xs text-slate-400">
              {matches.length === 0
                ? "No matches yet. Get relevant jobs on the Jobs page and run AI analysis to see best matches here."
                : `Showing ${matches.length} matches (score ≥ 80)`}
            </div>
            <JobCardList jobs={matches} selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <JobDisplay job={selectedJob} onMarkApplied={handleMarkApplied} onMarkSaved={handleMarkSaved} />
          </div>
        </div>
      </div>
    </div>
  );
}
