import Link from "next/link";
import { createClient } from "@/_lib/supabaseServer";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData.user?.id ?? null;

  let firstName: string | null = null;
  let lastName: string | null = null;

  if (uid) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", uid)
      .single();
    firstName = profile?.first_name ?? null;
    lastName = profile?.last_name ?? null;
  }

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "there";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-800/70 shadow-lg px-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-slate-300">Welcome</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome, {displayName} 👋</h1>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/preferences"
                  className="rounded-full border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-slate-400"
                >
                  Match Preferences
                </Link>
                <Link
                  href="/matches"
                  className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
                >
                  View All Matches
                </Link>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-900/60 border border-slate-700 px-4 py-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-100">
                  <span className="text-lg">🔥</span>
                  <span>0 Day Streak</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>View 5 matches to start your streak!</span>
                  <span className="h-1.5 w-28 bg-slate-800 rounded-full overflow-hidden">
                    <span className="block h-full w-0 bg-sky-500" />
                  </span>
                  <span>day 0/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
