"use client";

import { useMemo, useState } from "react";
import { JobListing } from "@/types/jobs";
import JobCardList from "./JobCardList";
import JobDisplay from "./JobDisplay";

const FALLBACK_JOBS: JobListing[] = [
  {
    id: "example-1",
    title: "Machine Learning Engineer",
    company: "TikTok",
    location: "San Jose, CA, USA",
    work_mode: "In Person",
    salary_range: "$136.8k - $259.2k /yr",
    description:
      "Build and scale the deduplication and copyright system that supports billions of users globally.",
  },
  {
    id: "example-2",
    title: "Graduate Applied Science Intern",
    company: "Twitch",
    location: "San Francisco, CA, USA",
    work_mode: "In Person",
    salary_range: "$76.53 /hr",
    description: "Develop ML models to improve content integrity and recommendations for a global audience.",
  },
];

type Props = {
  initialJobs: JobListing[];
};

export default function Jobs({ initialJobs }: Props) {
  const hydratedJobs = initialJobs.length ? initialJobs : FALLBACK_JOBS;
  const [jobs] = useState<JobListing[]>(hydratedJobs);
  const [selectedId, setSelectedId] = useState<string>(hydratedJobs[0]?.id ?? "");

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedId) ?? jobs[0],
    [jobs, selectedId]
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-20 py-8 space-y-6">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Search All Jobs</h1>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <button className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:border-slate-500">
                Save Search
              </button>
              <button className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:border-slate-500">
                Clear Filters
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search for roles, companies, or locations"
              className="w-full md:w-96 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            <div className="text-xs text-slate-400">Showing {jobs.length} jobs</div>
            <JobCardList jobs={jobs} selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <JobDisplay job={selectedJob} />
          </div>
        </div>
      </div>
    </div>
  );
}
