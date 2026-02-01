"use client";

import { JobListing } from "@/types/jobs";

type Props = {
  job?: JobListing;
};

export default function JobDisplay({ job }: Props) {
  if (!job) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs text-slate-400">{job.status ?? job.work_mode ?? ""}</div>
          <h2 className="text-xl font-semibold text-white">{job.title}</h2>
          <p className="text-sm text-slate-300">{job.company}</p>
          {job.match_score != null && (
            <div className="text-xs font-semibold text-emerald-300">Match score: {job.match_score}</div>
          )}
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200 hover:border-slate-500">
            Save
          </button>
          <button className="rounded-lg bg-sky-600 px-3 py-1 text-sm font-semibold text-white hover:bg-sky-500">
            Apply
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">{job.location}</span>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">{job.work_mode}</span>
        {job.salary_range && (
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">{job.salary_range}</span>
        )}
        {job.source_url && (
          <a
            href={job.source_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 underline"
          >
            Source
          </a>
        )}
      </div>
      <div className="text-sm leading-relaxed text-slate-200">{job.description}</div>
      {job.ai_analysis?.reasons && Array.isArray(job.ai_analysis.reasons) && (
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-slate-100">Why it matches:</p>
          <ul className="list-disc list-inside space-y-1">
            {job.ai_analysis.reasons.map((r: string, idx: number) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
