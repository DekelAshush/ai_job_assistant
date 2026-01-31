import { createClient } from "@/_lib/supabaseServer";
import Matches from "@/_components/dashboard/jobs/Matches";

export default async function MatchesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, user_id, title, company, location, work_mode, source_url, description, salary_range, ai_analysis, status, applied_at, created_at, updated_at"
    )
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("matches fetch error:", error.message);
  }

  return <Matches initialMatches={data ?? []} />;
}
