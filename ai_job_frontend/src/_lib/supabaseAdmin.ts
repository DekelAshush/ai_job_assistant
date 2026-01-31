import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client
 * * IMPORTANT SECURITY NOTES:
 * 1. This client uses the SERVICE_ROLE_KEY, which bypasses Row Level Security (RLS).
 * 2. It must ONLY be used in server-side environments (Node.js/Edge Runtime).
 * 3. Never expose this client or the service_role key to the browser/client-side.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      // Prevents the client from automatically refreshing tokens in a server environment.
      autoRefreshToken: false,
      // Crucial: Prevents the admin client from trying to store or reuse user sessions.
      // This ensures each request is isolated and treated as a pure 'Superuser' action.
      persistSession: false,
    },
  }
);