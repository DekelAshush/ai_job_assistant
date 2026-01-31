import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/_lib/supabaseAdmin";
import { createClient as createSupabaseServerClient } from "@/_lib/supabaseServer";

/**
 * Interface for the onboarding request body
 */
type OnboardingPayload = {
  role_values?: string[];
  roles?: string[];
  locations?: string[];
  work_modes?: string[];
  company_sizes?: string[];
  industries_prefer?: string[];
  industries_avoid?: string[];
  skills_prefer?: string[];
  skills_avoid?: string[];
  expected_salary?: number | null;
  job_status?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    // 1. Resolve user ID from Supabase session
    let userId: string | undefined;

    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id;
    } catch (e) {
      console.warn("[ONBOARDING] Supabase session lookup warning:", e);
    }

    // Unauthorized if no valid session or ID exists
    if (!userId) {
      console.error("[ONBOARDING_POST] Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and cast the incoming JSON payload
    const payload = (await req.json()) as OnboardingPayload;

    /**
     * 3. Sync User Preferences
     * We use 'upsert' to create a new record or update an existing one.
     * 'onConflict: user_id' ensures each user has only one preference row.
     */
    const { error: upsertError } = await supabaseAdmin.from("user_preferences").upsert(
      {
        user_id: userId, // Always use the verified ID from the session
        role_values: payload.role_values ?? [],
        roles: payload.roles ?? [],
        locations: payload.locations ?? [],
        work_modes: payload.work_modes ?? [],
        company_sizes: payload.company_sizes ?? [],
        industries_prefer: payload.industries_prefer ?? [],
        industries_avoid: payload.industries_avoid ?? [],
        skills_prefer: payload.skills_prefer ?? [],
        skills_avoid: payload.skills_avoid ?? [],
        expected_salary: payload.expected_salary ?? null,
        job_status: payload.job_status ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // Handle database errors during the upsert process
    if (upsertError) {
      console.error("[SUPABASE_UPSERT_ERROR]:", upsertError.message);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    /**
     * 4. Update Profile Status
     * Set 'onboarded' to true so the middleware can redirect the user to the dashboard.
     */
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ onboarded: true })
      .eq("id", userId);

    if (profileError) {
      console.error("[SUPABASE_PROFILE_UPDATE_ERROR]:", profileError.message);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 5. Update Supabase Auth user_metadata so middleware sees onboarded=true
    const { error: authMetaError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { onboarded: true },
    });

    if (authMetaError) {
      console.error("[SUPABASE_AUTH_META_UPDATE_ERROR]:", authMetaError.message);
      // Don't fail the whole request; return success but log the issue
    }

    // 6. Success response
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    // Catch-all for unexpected runtime errors
    console.error("[ONBOARDING_ROUTE_EXCEPTION]:", err);
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}