"use client";

import UserInfo from "./UserInfo";

const TITLE = "My Career Hub";
const SUBTITLE = "Manage your profile, personal info, and job preferences in one place.";
const BADGE = "Profile Overview";

type Props = {
  name: string;
  initials: string;
  status?: string | null;
};

export default function ProfileHeader({ name, initials, status }: Props) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 px-6 py-6 lg:px-8 lg:py-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-950/70 px-3 py-1 text-xs font-semibold text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>{BADGE}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{TITLE}</h1>
            <p className="mt-1 text-sm text-slate-300">{SUBTITLE}</p>
          </div>
        </div>

        <UserInfo name={name} initials={initials || "?"} status={status ?? ""} />
      </div>
    </div>
  );
}
