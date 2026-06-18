-- Versa migration 006: public user portfolios (tracker Pass 2 persistence)
--
-- Background:
--   • Pass 1 of the tracker is session-only — nothing is saved. Pass 2 lets
--     public users (NOT admins) save and reload portfolios.
--   • Public users authenticate via Supabase Auth (auth.users). This is entirely
--     separate from the admin login, which is a password + cookie mechanism and
--     does not touch Supabase Auth at all. The two systems do not interact.
--   • Each portfolio is one row holding its positions as JSONB — this mirrors the
--     in-memory Position[] shape exactly, so the calc engine stays the single
--     source of truth and Position type changes don't require new migrations.
--
-- Security model — READ THIS:
--   • RLS is the ENTIRE security boundary here. It is only enforced for requests
--     made through the ANON key carrying a logged-in user's JWT. The existing
--     supabaseAdmin client (secret key) BYPASSES RLS, so portfolio reads/writes
--     must go through a separate anon client, never supabaseAdmin.
--   • Every policy below keys off auth.uid() = user_id, so a user can only ever
--     see or touch their own rows.
--
-- Strategy: idempotent and safe to re-run. Unlike migrations 001–005 (additive
--   ALTERs on the existing `protocols` table), this is the first CREATE TABLE and
--   the first to enable RLS. The CREATE/ALTER/DROP-POLICY guards make re-runs safe.

-- ── Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  positions   jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Idempotent column guards (house rule: ADD COLUMN IF NOT EXISTS)
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS user_id    uuid;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS name       text;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS positions  jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Index for the common query (a user's own portfolios)
CREATE INDEX IF NOT EXISTS portfolios_user_id_idx ON portfolios (user_id);

-- ── Row-Level Security ───────────────────────────────────────
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- SELECT: a user can read only their own rows
DROP POLICY IF EXISTS portfolios_select_own ON portfolios;
CREATE POLICY portfolios_select_own
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: a user can create rows only for themselves
DROP POLICY IF EXISTS portfolios_insert_own ON portfolios;
CREATE POLICY portfolios_insert_own
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: a user can modify only their own rows, and cannot reassign ownership
DROP POLICY IF EXISTS portfolios_update_own ON portfolios;
CREATE POLICY portfolios_update_own
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: a user can delete only their own rows
DROP POLICY IF EXISTS portfolios_delete_own ON portfolios;
CREATE POLICY portfolios_delete_own
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Tell PostgREST (Supabase's API layer) to pick up the new table immediately.
NOTIFY pgrst, 'reload schema';
