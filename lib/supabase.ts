import { createClient } from "@supabase/supabase-js";

// All DB access is server-side only. The secret key bypasses RLS,
// which is safe because it never leaves the server.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);
