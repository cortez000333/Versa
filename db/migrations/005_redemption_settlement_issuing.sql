-- Versa migration 005: split Liquidity → Redemption + Settlement; track-record Issuing date
--
-- Background:
--   • The dashboard "Liquidity" column/field is being retired. It's replaced by
--     two facts shown only in the scorecard's asset-facts panel:
--       - Redemption  (e.g. "Daily", "24/7", "Monthly window")
--       - Settlement  (e.g. "T+0", "T+2")
--   • "Redemption" REUSES the existing `redemption_terms` column (already shown
--     in the facts panel), so existing values are preserved. Only "Settlement"
--     needs a brand-new column.
--   • The Track Record "Months live" field is replaced by "Issuing date"
--     (free-form text, e.g. "March 2023"). Stored as text to allow "March 2023".
--
-- Deprecated but LEFT IN PLACE (harmless, no longer read/written by the app):
--   liquidity, change_24h, vs_nav, months_live
--
-- Strategy: PURELY ADDITIVE and safe to run more than once (IF NOT EXISTS).

ALTER TABLE protocols ADD COLUMN IF NOT EXISTS settlement   text;  -- e.g. T+0, T+2
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS issuing_date text;  -- e.g. March 2023

-- Tell PostgREST (Supabase's API layer) to pick up the new columns immediately.
NOTIFY pgrst, 'reload schema';
