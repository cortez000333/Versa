-- Versa migration 009: allow logged-in users to submit research requests too
--
-- Background:
--   • Migration 008 granted INSERT to `anon` only. A logged-in user submits as
--     the `authenticated` role, which got "permission denied" (42501). The
--     research form is public and must work for everyone, so mirror the
--     insert-only access to `authenticated`.
--   • Still NO select policy for either role — submit only, never read.
--
-- Strategy: idempotent and safe to re-run.

DROP POLICY IF EXISTS research_requests_insert_authenticated ON research_requests;
CREATE POLICY research_requests_insert_authenticated
  ON research_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

GRANT INSERT ON TABLE research_requests TO authenticated;

NOTIFY pgrst, 'reload schema';
