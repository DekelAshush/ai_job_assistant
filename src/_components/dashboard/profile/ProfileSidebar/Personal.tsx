"use client";

import { useState } from "react";
import { supabaseClient } from "@/_lib/supabaseClient";
import { PersonalInfo } from "@/types/profile";

type Props = {
  userId: string | null;
  value: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
};

const fileName = (value?: string | null) => {
  if (!value) return null;
  const clean = (value.split("?")[0] ?? "").split("/").pop() ?? "";
  const withoutPrefix = clean.replace(/^[0-9a-f-]+-\d+-/i, "");
  return withoutPrefix || clean || null;
};

export default function Personal({ userId, value, onChange }: Props) {
  const [saving, setSaving] = useState(false);

  const updateField = (field: keyof PersonalInfo, newValue: any) => {
    onChange({ ...value, [field]: newValue });
  };

  const handleSave = async () => {
    if (!userId) {
      alert("Please sign in to save your profile.");
      return;
    }
    setSaving(true);
    const { error } = await supabaseClient
      .from("user_personal_info")
      .upsert(
        { user_id: userId, ...value, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    setSaving(false);
    if (error) {
      alert(error.message);
    } else {
      alert("Saved");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
        <h3 className="text-lg font-semibold mb-3">Personal Info</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">First Name</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={value.first_name ?? ""}
                onChange={(e) => updateField("first_name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Last Name</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={value.last_name ?? ""}
                onChange={(e) => updateField("last_name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Preferred Name</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={value.preferred_name ?? ""}
                onChange={(e) => updateField("preferred_name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Email</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm cursor-not-allowed opacity-80"
                value={value.email ?? ""}
                readOnly
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Email is managed via account settings; contact support to change.
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-400">Phone</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={value.phone ?? ""}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Location</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={value.location ?? ""}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Address</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={value.address1 ?? ""}
                onChange={(e) => updateField("address1", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Address 2</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={value.address2 ?? ""}
                onChange={(e) => updateField("address2", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Address 3</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={value.address3 ?? ""}
                onChange={(e) => updateField("address3", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Postal Code</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={value.postal_code ?? ""}
                onChange={(e) => updateField("postal_code", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Ethnicity</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={value.ethnicity ?? ""}
                onChange={(e) => updateField("ethnicity", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Gender</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                value={value.gender ?? ""}
                onChange={(e) => updateField("gender", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.authorized_us}
                onChange={(e) => updateField("authorized_us", e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm text-slate-200">Authorized to work in the US?</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.authorized_canada}
                onChange={(e) => updateField("authorized_canada", e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm text-slate-200">Authorized to work in Canada?</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.authorized_uk}
                onChange={(e) => updateField("authorized_uk", e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm text-slate-200">Authorized to work in the UK?</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.visa_sponsorship}
                onChange={(e) => updateField("visa_sponsorship", e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm text-slate-200">Require future visa sponsorship?</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.disability}
                onChange={(e) => updateField("disability", e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm text-slate-200">Do you have a disability?</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.lgbtq}
                onChange={(e) => updateField("lgbtq", e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm text-slate-200">Do you identify as LGBTQ+?</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.veteran}
                onChange={(e) => updateField("veteran", e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm text-slate-200">Are you a veteran?</label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-60 transition-colors text-sm font-semibold"
            >
              {saving ? "Saving..." : "Save Personal Info"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
