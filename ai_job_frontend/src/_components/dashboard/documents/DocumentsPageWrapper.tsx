"use client";

import { useEffect, useState } from "react";
import Documents from "@/_components/dashboard/profile/ProfileSidebar/Profile";
import { PersonalInfo } from "@/types/profile";
import { supabaseClient } from "@/_lib/supabaseClient";

export default function DocumentsPageWrapper() {
  const [personal, setPersonal] = useState<PersonalInfo>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabaseClient.auth.getUser();
      const uid = auth.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;

      const { data } = await supabaseClient
        .from("user_personal_info")
        .select("*")
        .eq("user_id", uid)
        .single();

      if (data) {
        setPersonal(data as PersonalInfo);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="w-full px-6 md:px-12 lg:px-20 xl:px-28 py-12 space-y-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-800/60 px-6 py-5 shadow-lg shadow-slate-900/40 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-900/60 text-sky-200 text-xs font-semibold border border-sky-700/60">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Documents Hub
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-white tracking-tight">Manage Your Documents</h1>
            <p className="text-sm text-slate-300">Upload, view, and delete resumes and cover letters.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
          <Documents userId={userId} value={personal} onChange={setPersonal} />
        </div>
      </div>
    </div>
  );
}
