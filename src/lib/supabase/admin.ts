import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase admin client — bypasses RLS using the service role key.
 * Only use server-side, never expose to the client.
 *
 * Uses lazy initialization to avoid instantiate-time env var errors during `next build`.
 */
let _supabaseAdmin: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _supabaseAdmin;
}

// Export as a Proxy that lazy-init on first property access
// e.g. supabaseAdmin.from(...) works identically whether already initialized or not
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = new Proxy({} as any, {
  get(_target, prop) {
    const client = getClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
