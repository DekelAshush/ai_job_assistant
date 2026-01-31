"use client";

import { useState } from "react";
import { supabaseClient } from "@/_lib/supabaseClient";
import { JobPreferences } from "@/types/profile";

type Props = {
  userId: string | null;
  value: JobPreferences;
  onChange: (prefs: JobPreferences) => void;
};

const stringToArray = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

export default function Preferences({ userId, value, onChange }: Props) {
  const [saving, setSaving] = useState(false);

  const updateField = (field: keyof JobPreferences, newValue: any) => {
    onChange({ ...value, [field]: newValue });
  };

  const handleSave = async () => {
    if (!userId) {
      alert("Please sign in to save your preferences.");
      return;
    }
    setSaving(true);
    const { error } = await supabaseClient.from("user_preferences").upsert(
      {
        user_id: userId,
        ...value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    setSaving(false);
    if (error) {
      alert(error.message);
    } else {
      alert("Preferences saved");
    }
  };

  return (
    <>
      <h3 className="text-lg font-semibold mb-3">Job Preferences</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Job Status</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={value.job_status ?? ""}
              onChange={(e) => updateField("job_status", e.target.value)}
              placeholder="Actively looking, Open to offers, etc."
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Expected Salary</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={value.expected_salary ?? ""}
              onChange={(e) => updateField("expected_salary", e.target.value ? Number(e.target.value) : null)}
              placeholder="125000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Role Values</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={(value.role_values ?? []).join(", ")}
              onChange={(e) => updateField("role_values", stringToArray(e.target.value))}
              placeholder="Impact, Growth, Learning"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Roles</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={(value.roles ?? []).join(", ")}
              onChange={(e) => updateField("roles", stringToArray(e.target.value))}
              placeholder="Frontend Engineer, Fullstack Engineer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Locations</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={(value.locations ?? []).join(", ")}
              onChange={(e) => updateField("locations", stringToArray(e.target.value))}
              placeholder="Remote, New York, London"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Work Modes</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={(value.work_modes ?? []).join(", ")}
              onChange={(e) => updateField("work_modes", stringToArray(e.target.value))}
              placeholder="Remote, Hybrid, Onsite"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Preferred Company Sizes</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={(value.company_sizes ?? []).join(", ")}
              onChange={(e) => updateField("company_sizes", stringToArray(e.target.value))}
              placeholder="1-10, 50-200, 500+"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Preferred Industries</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={(value.industries_prefer ?? []).join(", ")}
              onChange={(e) => updateField("industries_prefer", stringToArray(e.target.value))}
              placeholder="Fintech, AI, Developer Tools"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Industries to Avoid</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={(value.industries_avoid ?? []).join(", ")}
              onChange={(e) => updateField("industries_avoid", stringToArray(e.target.value))}
              placeholder="Gambling, Tobacco"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Skills to Highlight</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={(value.skills_prefer ?? []).join(", ")}
              onChange={(e) => updateField("skills_prefer", stringToArray(e.target.value))}
              placeholder="React, TypeScript, Node.js"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Skills to Avoid</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={(value.skills_avoid ?? []).join(", ")}
              onChange={(e) => updateField("skills_avoid", stringToArray(e.target.value))}
              placeholder="PHP, COBOL"
            />
          </div>
          <div />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-60 transition-colors text-sm font-semibold"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </>
  );
}
