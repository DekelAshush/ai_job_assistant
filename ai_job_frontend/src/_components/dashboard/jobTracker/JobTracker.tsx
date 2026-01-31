"use client";

import { useMemo, useState } from "react";
import { Job, Status } from "@/types/jobTracker";

const STATUS_ORDER: Status[] = ["saved", "applied", "interviewing", "offer", "rejected"];
const STATUS_LABEL: Record<Status, string> = {
    saved: "Saved",
    applied: "Applied",
    interviewing: "Interviewing",
    offer: "Offer",
    rejected: "Rejected",
};

export default function JobTracker() {
    // Placeholder data; wire this to Supabase later.
    const [jobs] = useState<Job[]>([]);

    const totals = useMemo(() => {
        const counts: Record<Status, number> = {
            saved: 0,
            applied: 0,
            interviewing: 0,
            offer: 0,
            rejected: 0,
        };
        for (const job of jobs) counts[job.status] += 1;
        return counts;
    }, [jobs]);

    const totalJobs = jobs.length;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <div className="w-full px-6 md:px-12 lg:px-20 xl:px-28 py-10 space-y-6">
                <header className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold">Your Job Tracker</h1>
                        <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200">
                            {totalJobs} TOTAL JOBS
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                        <span className="font-medium text-sky-200">Active</span>
                    </div>
                </header>

                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                        {STATUS_ORDER.map((status) => (
                            <div key={status} className="p-4 space-y-3">
                                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                                    <span>{STATUS_LABEL[status]}</span>
                                    <span className="rounded-md bg-slate-900 px-2 py-1 text-slate-200">{totals[status]}</span>
                                </div>
                                <div className="h-24 rounded-lg border border-dashed border-slate-700 bg-slate-900/60 flex items-center justify-center text-xs text-slate-500">
                                    No jobs yet
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
