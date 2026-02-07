import { createClient } from "@/_lib/supabaseServer";
import Matches from "@/_components/dashboard/matches/Matches";
import { JobListing } from "@/types/jobs";

const MIN_MATCH_SCORE = 80;

export default async function MatchesPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData.user?.id ?? null;

  const { data, error } = uid
    ? await supabase
        .from("jobs")
        .select(
          "id, user_id, title, company, location, work_mode, source_url, description, salary_range, ai_analysis, status, applied_at, created_at, updated_at"
        )
        .eq("user_id", uid)
        .order("updated_at", { ascending: false })
        .limit(100)
    : { data: [], error: null };

  if (error) {
    console.error("matches fetch error:", error.message);
  }

  const highMatches = (data ?? []).filter((j) => {
    const score = (j as JobListing).ai_analysis?.match_score;
    return score != null && score >= MIN_MATCH_SCORE;
  }) as JobListing[];

  return <Matches initialMatches={highMatches} />;
}
