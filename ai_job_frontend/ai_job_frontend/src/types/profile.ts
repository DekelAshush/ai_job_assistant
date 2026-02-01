export type PersonalInfo = {
  first_name?: string | null;
  last_name?: string | null;
  preferred_name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  postal_code?: string | null;
  ethnicity?: string | null;
  authorized_us?: boolean | null;
  authorized_canada?: boolean | null;
  authorized_uk?: boolean | null;
  visa_sponsorship?: boolean | null;
  disability?: boolean | null;
  lgbtq?: boolean | null;
  gender?: string | null;
  veteran?: boolean | null;
  resume_url?: string | null;
  cover_letter_url?: string | null;
};

export type JobPreferences = {
  idx?: number | null;
  user_id?: string | null;
  job_status?: string | null;
  expected_salary?: number | null;
  roles?: string[] | null;
  role_values?: string[] | null;
  locations?: string[] | null;
  work_modes?: string[] | null;
  company_sizes?: string[] | null;
  industries_prefer?: string[] | null;
  industries_avoid?: string[] | null;
  skills_prefer?: string[] | null;
  skills_avoid?: string[] | null;
};
