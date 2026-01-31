"use client";

import { useMemo, useState } from "react";
import { JobListing } from "@/types/jobs";
import JobCardList from "./JobCardList";
import JobDisplay from "./JobDisplay";

type Props = {
  initialMatches: JobListing[];
};

export default function MatchesWrapper({ initialMatches }: Props) {
  const [matches] = useState<JobListing[]>(initialMatches);
  const [selectedId, setSelectedId] = useState<string>(initialMatches[0]?.id ?? "");

  const selectedJob = useMemo(
    () => matches.find((j) => j.id === selectedId) ?? matches[0],
    [matches, selectedId]
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-20 py-8 space-y-6">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl font-semibold">Best Matches</h1>
            <div className="text-sm text-slate-400">AI-ranked roles based on your profile</div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <div className="text-xs text-slate-400">Showing {matches.length} matches</div>
            <JobCardList jobs={matches} selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <JobDisplay job={selectedJob} />
          </div>
        </div>
      </div>
    </div>
  );
}
