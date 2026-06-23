import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── Public client (browser) ──────────────────────────────────
// Uses the ANON / publishable key, which RESPECTS RLS. This is the
// client public users hit for auth (signup/login) and for saving /
// loading their own portfolios. The key is public-by-design and safe
// to expose in the browser. RLS policies (migration 006) ensure each
// user can only ever read/write their own rows.
//
// Lives in its OWN file (separate from supabaseAdmin) so the browser
// bundle never pulls in the secret-key client — importing that would
// reference server-only env vars and crash client-side.
//
// SINGLE SHARED INSTANCE: the client is cached on globalThis in the
// browser so that React Fast Refresh / multiple imports never create
// duplicate clients. Duplicate clients each spin up their own auth
// (GoTrueClient) instance against the SAME storage key; they then race
// over the stored session, and the instance that loses can make DB
// requests WITHOUT the logged-in user's JWT — which RLS rejects with a
// 403. One shared instance means the session established at /account
// login is the same session the tracker's queries authenticate with,
// so every request carries `Authorization: Bearer <jwt>`.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const globalForSupabase = globalThis as unknown as {
  __versaSupabase?: SupabaseClient;
};

export const supabase =
  globalForSupabase.__versaSupabase ??
  createClient(url, anonKey, {
    auth: {
      // Store the session (localStorage) so a login on /account survives
      // navigation and page refreshes.
      persistSession: true,
      // Refresh the access token before it expires, in the background.
      autoRefreshToken: true,
      // Pick up the session from the URL hash after an email-link flow.
      detectSessionInUrl: true,
    },
  });

// Only cache on the client. On the server (SSR of client components)
// we don't want a single shared, session-bearing instance across
// requests — but this client is only ever used in the browser anyway.
if (typeof window !== "undefined") {
  globalForSupabase.__versaSupabase = supabase;
}
