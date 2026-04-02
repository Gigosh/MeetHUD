import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client — bypasses RLS using the service role key.
 * Only use server-side, never expose to the client.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
