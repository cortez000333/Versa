import { createClient } from "@supabase/supabase-js";

// ── Admin client (server-side only) ──────────────────────────
// Uses the SECRET key, which BYPASSES RLS. Safe because it never
// leaves the server. Used for admin CRUD on the protocols table.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// NOTE: The public (anon-key) client lives in its own file,
// lib/supabaseClient.ts — keeping it separate ensures the browser
// bundle never imports this secret-key client (which references
// server-only env vars and would crash client-side).
