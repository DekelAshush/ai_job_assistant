"use client";

import { useEffect, useMemo, useState } from "react";
import { Job, Status } from "@/types/jobTracker";
import { supabaseClient } from "@/_lib/supabaseClient";

const STATUS_ORDER: Status[] = ["saved", "applied", "interviewing", "offer", "rejected"];
const STATUS_LABEL: Record<Status, string> = {
    saved: "Saved",
    applied: "Applied",
    interviewing: "Interviewing",
    offer: "Offer",
    rejected: "Rejected",
};

const TRACKER_STATUSES: string[] = STATUS_ORDER;

type TrackerCardProps = {
    job: Job;
    onStatusChange: (jobId: string, newStatus: Status) => void;
};

function TrackerCard({ job, onStatusChange }: TrackerCardProps) {
    const [updating, setUpdating] = useState(false);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as Status;
        if (newStatus === job.status) return;
        setUpdating(true);
        try {
            const { data: session } = await supabaseClient.auth.getSession();
            const uid = session?.session?.user?.id;
            if (!uid) return;
            await supabaseClient
                .from("jobs")
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq("id", job.id)
                .eq("user_id", uid);
            onStatusChange(job.id, newStatus);
        } finally {
            setUpdating(false);
        }
    };

    const cardContent = (
        <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-left shadow-sm space-y-2">
            {job.source_url ? (
                <a href={job.source_url} target="_blank" rel="noreferrer" className="block">
                    <div className="text-sm font-medium text-white truncate hover:text-sky-300" title={job.title}>{job.title}</div>
                    <div className="text-xs text-slate-400 truncate" title={job.company}>{job.company}</div>
                </a>
            ) : (
                <>
                    <div className="text-sm font-medium text-white truncate" title={job.title}>{job.title}</div>
                    <div className="text-xs text-slate-400 truncate" title={job.company}>{job.company}</div>
                </>
            )}
            <div className="flex items-center gap-1.5 pt-0.5" onClick={(e) => e.stopPropagation()}>
                <label className="sr-only">Status</label>
                <select
                    value={job.status}
                    onChange={handleStatusChange}
                    disabled={updating}
                    className="w-full min-w-0 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                >
                    {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                </select>
            </div>
        </div>
    );

    return cardContent;
}

export default function JobTracker() {
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        const load = async () => {
            const { data: session } = await supabaseClient.auth.getSession();
            const uid = session?.session?.user?.id;
            if (!uid) return;
            const { data, error } = await supabaseClient
                .from("jobs")
                .select("id, title, company, status, source_url")
                .eq("user_id", uid)
                .in("status", TRACKER_STATUSES);
            if (error) {
                console.error("JobTracker load error:", error.message);
                return;
            }
            const valid = (data ?? []).filter((row) => TRACKER_STATUSES.includes(row.status as string)) as Job[];
            setJobs(valid);
        };
        load();
    }, []);

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

    const jobsByStatus = useMemo(() => {
        const map: Record<Status, Job[]> = {
            saved: [],
            applied: [],
            interviewing: [],
            offer: [],
            rejected: [],
        };
        for (const job of jobs) {
            if (map[job.status]) map[job.status].push(job);
        }
        return map;
    }, [jobs]);

    const handleStatusChange = (jobId: string, newStatus: Status) => {
        setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    };

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
                            <div key={status} className="p-4 space-y-3 min-h-[200px]">
                                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                                    <span>{STATUS_LABEL[status]}</span>
                                    <span className="rounded-md bg-slate-900 px-2 py-1 text-slate-200">{totals[status]}</span>
                                </div>
                                <div className="space-y-2">
                                    {jobsByStatus[status].length === 0 ? (
                                        <div className="h-24 rounded-lg border border-dashed border-slate-700 bg-slate-900/60 flex items-center justify-center text-xs text-slate-500">
                                            No jobs yet
                                        </div>
                                    ) : (
                                        jobsByStatus[status].map((job) => <TrackerCard key={job.id} job={job} onStatusChange={handleStatusChange} />)
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
