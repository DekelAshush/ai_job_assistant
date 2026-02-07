"use client";

import { useState } from "react";
import { JobListing } from "@/types/jobs";
import { supabaseClient } from "@/_lib/supabaseClient";

type Props = {
  job?: JobListing;
  onMarkApplied?: (job: JobListing) => void;
  onMarkSaved?: (job: JobListing) => void;
};

export default function JobDisplay({ job, onMarkApplied, onMarkSaved }: Props) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!job) return null;

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!job.source_url) return;
    setShowApplyModal(true);
  };

  const handleDidApplyYes = async () => {
    if (!job?.id || updating) return;
    setUpdating(true);
    try {
      const { data } = await supabaseClient.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return;
      await supabaseClient
        .from("jobs")
        .update({
          status: "applied",
          applied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("user_id", uid);
      const updated = { ...job, status: "applied", applied_at: new Date().toISOString() };
      onMarkApplied?.(updated);
      if (job.source_url) window.open(job.source_url, "_blank", "noopener,noreferrer");
    } finally {
      setUpdating(false);
      setShowApplyModal(false);
    }
  };

  const handleDidApplyNo = () => {
    setShowApplyModal(false);
  };

  const handleSaveClick = async () => {
    if (!job?.id || saving) return;
    setSaving(true);
    try {
      const { data } = await supabaseClient.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return;
      const { error } = await supabaseClient
        .from("jobs")
        .update({
          status: "saved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("user_id", uid);
      if (!error) {
        const updated = { ...job, status: "saved" as const };
        onMarkSaved?.(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">{job.status ?? job.work_mode ?? ""}</div>
            <h2 className="text-xl font-semibold text-white">{job.title}</h2>
            <p className="text-sm text-slate-300">{job.company}</p>
            {job.ai_analysis?.match_score != null && (
              <div className="text-xs font-semibold text-emerald-300">Match score: {job.ai_analysis.match_score}</div>
            )}
            {job.ai_analysis?.fit_reason && (
              <p className="text-xs text-slate-400 mt-1">{job.ai_analysis.fit_reason}</p>
            )}
          </div>
          <div className="flex gap-2" suppressHydrationWarning>
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={saving || job.status === "saved"}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200 hover:border-slate-500 disabled:opacity-50"
              suppressHydrationWarning
            >
              {saving ? "..." : job.status === "saved" ? "Saved" : "Save"}
            </button>
            {job.source_url ? (
              <button
                type="button"
                onClick={handleApplyClick}
                className="rounded-lg bg-sky-600 px-3 py-1 text-sm font-semibold text-white hover:bg-sky-500"
                suppressHydrationWarning
              >
                Apply
              </button>
            ) : (
              <span className="rounded-lg bg-slate-700 px-3 py-1 text-sm text-slate-400 cursor-not-allowed" suppressHydrationWarning>
                Apply
              </span>
            )}
          </div>
        </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">{job.location}</span>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">{job.work_mode}</span>
        {job.salary_range && (
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">{job.salary_range}</span>
        )}
      </div>
      <div className="text-sm leading-relaxed text-slate-200">{job.description}</div>
    </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowApplyModal(false)}>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-medium text-white mb-4">Did you apply?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDidApplyYes}
                disabled={updating}
                className="flex-1 rounded-lg bg-sky-600 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
              >
                {updating ? "..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={handleDidApplyNo}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-700 py-2 text-sm text-slate-200 hover:bg-slate-600"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
