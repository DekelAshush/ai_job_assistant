import Jobs from "@/_components/dashboard/jobs/Jobs";
import { createClient } from "@/_lib/supabaseServer";

export default async function JobsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, user_id, title, company, location, work_mode, source_url, description, salary_range, ai_analysis, status, applied_at, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("jobs fetch error:", error.message);
  }

  return <Jobs initialJobs={data ?? []} />;
}
