"use client";


import { useMemo, useState } from "react";
import ProfileSidebar from "./ProfileSidebar/ProfileSidebar";
import Profile from "./ProfileSidebar/Profile";
import Personal from "./ProfileSidebar/Personal";
import Preferences from "./ProfileSidebar/Preferences";
import ProfileHeader from "./profileHeader/ProfileHeader";
import { PersonalInfo, JobPreferences } from "@/types/profile";

type Props = {
  userId: string | null;
  initialInfo: PersonalInfo;
  initialJobPrefs: JobPreferences;
};

export default function ProfilePageClient({ userId: initialUserId, initialInfo, initialJobPrefs }: Props) {
  const [userId] = useState<string | null>(initialUserId);
  const [info, setInfo] = useState<PersonalInfo>(initialInfo);
  const [jobPrefs, setJobPrefs] = useState<JobPreferences>(initialJobPrefs);
  const [activeTab, setActiveTab] = useState<"profile" | "personal" | "preferences">("profile");

  const initials = useMemo(() => {
    const first = info.first_name?.trim() ?? "";
    const last = info.last_name?.trim() ?? "";
    if (!first && !last) return "DA";
    const firstInitial = first ? first[0]?.toUpperCase() : "";
    const lastInitial = last ? last[0]?.toUpperCase() : "";
    return `${firstInitial}${lastInitial || ""}` || "DA";
  }, [info.first_name, info.last_name]);

  const displayName = useMemo(
    () => [info.first_name, info.last_name].filter(Boolean).join(" ") || "Your profile",
    [info.first_name, info.last_name]
  );
  const displayStatus = jobPrefs.job_status || "Actively looking";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="w-full px-10 md:px-16 lg:px-24 xl:px-32 py-12 space-y-8">
        <ProfileHeader name={displayName} initials={initials} status={displayStatus} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 max-w-xs w-full">
            <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <div className="lg:col-span-3 space-y-6">
            {activeTab === "profile" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
                <Profile userId={userId} value={info} onChange={setInfo} />
              </div>
            )}
            {activeTab === "personal" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
                <Personal userId={userId} value={info} onChange={setInfo} />
              </div>
            )}
            {activeTab === "preferences" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
                <Preferences userId={userId} value={jobPrefs} onChange={setJobPrefs} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
