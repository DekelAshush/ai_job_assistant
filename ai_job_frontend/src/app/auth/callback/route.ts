import { NextResponse } from "next/server";
import { createClient } from "@/_lib/supabaseServer";
import { supabaseAdmin } from "@/_lib/supabaseAdmin";

const splitName = (fullName: string | null | undefined) => {
  if (!fullName) return { firstName: null, lastName: null };
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || null,
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient(); // שימוש ב-Server Client
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Fetch the authenticated user from the session cookies
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userError && userData.user) {
        const u = userData.user;
        const meta = u.user_metadata || {};
        const fullName = meta.full_name || meta.name || null;
        const { firstName, lastName } = splitName(fullName);
        const provider = (u.app_metadata as any)?.provider || "google";

        // Upsert profile with service role to bypass RLS
        const { error: upsertError } = await supabaseAdmin.from("profiles").upsert(
          {
            id: u.id,
            email: u.email,
            first_name: meta.first_name ?? firstName,
            last_name: meta.last_name ?? lastName,
            provider,
            avatar_url: meta.avatar_url ?? meta.picture ?? null,
          },
          { onConflict: "id" }
        );

        if (upsertError) {
          console.error("Auth callback upsert error:", upsertError.message);
        }
      } else if (userError) {
        console.error("Auth callback user fetch error:", userError.message);
      }

      // Session is established; hit home and let middleware route to dashboard or preferences
      return NextResponse.redirect(`${origin}/`);
    }
    
    console.error("Auth error:", error.message);
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}