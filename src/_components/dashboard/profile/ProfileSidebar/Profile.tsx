"use client";

import Documents from "../Documents";
import { PersonalInfo } from "@/types/profile";

type Props = {
    userId: string | null;
    value: PersonalInfo;
    onChange: (info: PersonalInfo) => void;
};

export default function DefaultProfile({ userId, value, onChange }: Props) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium bg-slate-900 border border-slate-700">
                <span className="flex items-center gap-3">
                    <span className="text-base">📝</span>
                    Manage and tailor all of your job search documents here!

                </span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                <Documents userId={userId} value={value} onChange={onChange} />
            </div>
        </div>
    );
}
