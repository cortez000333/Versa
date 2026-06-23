-- Versa migration 007: grant table privileges on portfolios to authenticated users
--
-- Background:
--   • Migration 006 created the `portfolios` table and enabled RLS with four
--     per-user ownership policies — but did NOT grant base table privileges to
--     the `authenticated` role. Postgres checks table-level GRANTs BEFORE RLS,
--     so logged-in users got "permission denied for table portfolios" (code
--     42501) on every read/write — RLS never even ran.
--   • This grants the `authenticated` role the CRUD privileges it needs. RLS
--     still governs WHICH rows each user can touch (auth.uid() = user_id), so
--     this does NOT weaken security — it just lets RLS do its job.
--   • The `anon` role is intentionally NOT granted: only logged-in users save
--     portfolios.
--
-- Strategy: idempotent — GRANT is safe to run more than once.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE portfolios TO authenticated;

-- Tell PostgREST (Supabase's API layer) to pick up the change immediately.
NOTIFY pgrst, 'reload schema';
