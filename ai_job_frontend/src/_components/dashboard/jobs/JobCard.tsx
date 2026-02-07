"use client";

import { JobListing } from "@/types/jobs";

type Props = {
  job: JobListing;
  active: boolean;
  onSelect: (id: string) => void;
};

export default function JobCard({ job, active, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(job.id)}
      suppressHydrationWarning
      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? "border-sky-500 bg-slate-800/70 shadow-lg shadow-sky-900/20"
          : "border-slate-800 bg-slate-900/60 hover:border-slate-600"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{job.status ?? job.work_mode ?? ""}</span>
        <span className="text-xs text-slate-400">{job.work_mode ?? ""}</span>
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{job.title}</div>
      <div className="text-xs text-slate-300">{job.company}</div>
      <div className="mt-1 text-xs text-slate-400">{job.location}</div>
      {job.salary_range && <div className="mt-1 text-xs font-medium text-emerald-300">{job.salary_range}</div>}
    </button>
  );
}
