-- Versa migration 001: Scorecard page columns
-- Adds columns to support the new asset "scorecard" page:
--   * six proprietary scores (number 0-10) + an explanation note each
--   * numeric values for the true-yield calculator
--   * short "fact" fields for the asset-facts strip
--   * two narrative text fields
--
-- Strategy: PURELY ADDITIVE. Nothing existing is changed or dropped, so the
-- current market dashboard and /protocol detail page keep working untouched.
-- (The old risk_* columns stay in place and can be retired later.)
--
-- Safe to run more than once thanks to IF NOT EXISTS.

-- 1. The six proprietary scores (0-10) + their explanation notes -----------
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS score_transparency        smallint;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS note_transparency         text;

ALTER TABLE protocols ADD COLUMN IF NOT EXISTS score_liquidity_friction  smallint;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS note_liquidity_friction   text;

ALTER TABLE protocols ADD COLUMN IF NOT EXISTS score_real_cost           smallint;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS note_real_cost            text;

ALTER TABLE protocols ADD COLUMN IF NOT EXISTS score_track_record        smallint;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS note_track_record         text;

ALTER TABLE protocols ADD COLUMN IF NOT EXISTS score_counterparty        smallint;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS note_counterparty         text;

ALTER TABLE protocols ADD COLUMN IF NOT EXISTS score_regulatory          smallint;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS note_regulatory           text;

-- 2. Numeric values for the true-yield calculator -------------------------
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS nav_per_token  numeric;  -- e.g. 1.080
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS market_price   numeric;  -- e.g. 1.082
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS headline_yield numeric;  -- advertised APY, e.g. 4.2
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS fee_drag       numeric;  -- all-in annual fee %, e.g. 0.55

-- 3. Short "fact" fields for the asset-facts strip ------------------------
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS issuer_name      text;  -- e.g. "Ondo Finance"
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS token_standard   text;  -- e.g. "ERC-20 (rebasing)"
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS redemption_terms text;  -- short, e.g. "Daily, T+2"
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS custodian        text;  -- e.g. "Ankura Trust"

-- 4. Narrative text fields ------------------------------------------------
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS plain_read       text;  -- "The plain read" paragraph
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS exit_routes_note text;  -- "Where holders have exited" note
