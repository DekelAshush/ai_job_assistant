export type JobMode = "Remote" | "In Person" | "Hybrid" | string;

export type JobListing = {
  id: string;
  user_id?: string | null;
  title: string;
  company: string;
  location: string;
  work_mode: JobMode;
  source_url?: string | null;
  description?: string | null;
  salary_range?: string | null;
  ai_analysis?: { 
    match_score?: number | null; 
    fit_reason?: string | null;
    summary?: string;
    missing_skills?: string[];
    [k: string]: unknown 
  } | null;
  /** Derived from ai_analysis.match_score for display; not a DB column */
  status?: string | null;
  applied_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
