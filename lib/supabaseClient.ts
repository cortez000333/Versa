import { createClient } from "@supabase/supabase-js";

// ── Public client (browser + server) ─────────────────────────
// Uses the ANON key, which RESPECTS RLS. This is the client public
// users hit for auth (signup/login) and for saving/loading their
// own portfolios. The anon key is public-by-design and safe to
// expose in the browser. RLS policies (migration 006) ensure each
// user can only ever read/write their own rows.
//
// Lives in its OWN file (separate from supabaseAdmin) so the browser
// bundle never pulls in the secret-key client — importing that would
// reference server-only env vars and crash client-side.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
