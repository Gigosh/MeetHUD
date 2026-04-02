import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // During Vercel build (SSG), env vars may not be set yet.
  // Return a placeholder that will be replaced on the client.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === "placeholder.supabase.co") {
    // Return a dummy client for build-time prerendering
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-anon-key"
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
