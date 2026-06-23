-- Versa migration 008: research_requests table (paid research intake form)
--
-- Background:
--   • The /research page has a public form: anyone can SUBMIT a request
--     (name, email, client type, asset, scope, acknowledgment), but ONLY
--     the admin should be able to READ submissions.
--   • Security model: public can INSERT, public can NOT SELECT, admin reads
--     all via supabaseAdmin (secret key, bypasses RLS). No select policy for
--     public/users → they can never read submissions.
--   • GRANT INSERT is required (Postgres checks grants before RLS).
--
-- Strategy: idempotent and safe to re-run.

CREATE TABLE IF NOT EXISTS research_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  name          text NOT NULL,
  email         text NOT NULL,
  client_type   text NOT NULL,
  asset         text NOT NULL,
  scope         text NOT NULL,
  acknowledged  boolean NOT NULL DEFAULT false
);

ALTER TABLE research_requests ADD COLUMN IF NOT EXISTS name         text;
ALTER TABLE research_requests ADD COLUMN IF NOT EXISTS email        text;
ALTER TABLE research_requests ADD COLUMN IF NOT EXISTS client_type  text;
ALTER TABLE research_requests ADD COLUMN IF NOT EXISTS asset        text;
ALTER TABLE research_requests ADD COLUMN IF NOT EXISTS scope        text;
ALTER TABLE research_requests ADD COLUMN IF NOT EXISTS acknowledged boolean NOT NULL DEFAULT false;

ALTER TABLE research_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS research_requests_insert_anon ON research_requests;
CREATE POLICY research_requests_insert_anon
  ON research_requests FOR INSERT
  TO anon
  WITH CHECK (true);

GRANT INSERT ON TABLE research_requests TO anon;

NOTIFY pgrst, 'reload schema';
