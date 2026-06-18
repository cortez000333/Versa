-- Versa migration 004: Asset logo
-- Adds a single column to hold a logo image URL for each asset.
-- The admin form gains a "Logo URL" field; the scorecard header and the
-- dashboard table row show the image, falling back to the letter square
-- when the column is empty.
--
-- Strategy: PURELY ADDITIVE and safe to run more than once (IF NOT EXISTS).

ALTER TABLE protocols ADD COLUMN IF NOT EXISTS logo_url text;  -- e.g. https://example.com/logo.png

-- Tell PostgREST (Supabase's API layer) to pick up the new column immediately.
NOTIFY pgrst, 'reload schema';
