import { NextResponse } from "next/server";
import { createClient } from "@/_lib/supabaseServer";
import { supabaseAdmin } from "@/_lib/supabaseAdmin";

const splitName = (full?: string | null) => {
  if (!full) return { first: null, last: null };
  const parts = full.trim().split(/\s+/);
  return {
    first: parts[0] || null,
    last: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
};

export async function POST() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const u = data.user;
  const meta = u.user_metadata || {};
  const full = meta.full_name || meta.name || null;
  const derived = splitName(full);
  const firstName = meta.first_name ?? derived.first;
  const lastName = meta.last_name ?? derived.last;

  const payload = {
    id: u.id,
    email: u.email,
    first_name: firstName ?? null,
    last_name: lastName ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabaseAdmin.from("profiles").upsert(payload, { onConflict: "id" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
