import { createClient } from "@supabase/supabase-js";

// ── Admin client (server-side only) ──────────────────────────
// Uses the SECRET key, which BYPASSES RLS. Safe because it never
// leaves the server. Used for admin CRUD on the protocols table.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// ── Public client (browser + server) ─────────────────────────
// Uses the ANON key, which RESPECTS RLS. This is the client public
// users hit for auth (signup/login) and for saving/loading their
// own portfolios. The anon key is public-by-design and safe to
// expose in the browser. RLS policies (migration 006) ensure each
// user can only ever read/write their own rows.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
