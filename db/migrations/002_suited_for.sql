-- Versa migration 002: "Suited for" columns
-- Adds columns to support the scorecard "Suited for" panel:
--   * suited_for_tags  — comma-separated investor-type tags (descriptive,
--     drawn from a fixed set in the admin form)
--   * suited_for_text  — a short sentence or two describing the natural holder
--
-- These describe who the ASSET suits — never advice to a specific user.
--
-- Strategy: PURELY ADDITIVE. Nothing existing is changed or dropped, so the
-- dashboard, scorecard, and admin form keep working untouched.
-- Safe to run more than once thanks to IF NOT EXISTS.

ALTER TABLE protocols ADD COLUMN IF NOT EXISTS suited_for_tags  text;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS suited_for_text  text;
