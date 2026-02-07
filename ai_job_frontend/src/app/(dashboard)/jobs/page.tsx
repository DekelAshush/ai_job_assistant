import Jobs from "@/_components/dashboard/jobs/Jobs";
import { createClient } from "@/_lib/supabaseServer";

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData.user?.id ?? null;

  const { data: jobsData, error } = uid
    ? await supabase
        .from("jobs")
        .select("id, user_id, title, company, location, work_mode, source_url, description, salary_range, ai_analysis, status, applied_at, created_at, updated_at")
        .eq("user_id", uid)
        .order("updated_at", { ascending: false })
    : { data: [], error: null };

  if (error) {
    console.error("jobs fetch error:", error.message);
  }

  let hasResume = false;
  if (uid) {
    const { data: personal } = await supabase
      .from("user_personal_info")
      .select("resume_url")
      .eq("user_id", uid)
      .maybeSingle();
    hasResume = Boolean(personal?.resume_url);
  }

  return <Jobs initialJobs={jobsData ?? []} hasResume={hasResume} />;
}
