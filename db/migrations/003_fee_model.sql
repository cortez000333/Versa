-- Versa migration 003: Structured fee model
-- Replaces the single flat "fee_drag" assumption with a structured model that
-- distinguishes fee types, so the true-yield calculator can treat each correctly:
--   * fee_flat        — annual management fee, % of CAPITAL          (e.g. 0.5)
--   * fee_performance — annual performance fee, % of the YIELD       (e.g. 10)
--   * fee_entry       — one-time fee on subscription, % of capital   (e.g. 0.04)
--   * fee_exit        — one-time fee on redemption, % of capital     (e.g. 0.03)
--
-- The old fee_drag column is KEPT (harmless) but no longer used by the app.
--
-- Strategy: PURELY ADDITIVE. Nothing existing is changed or dropped.
-- Safe to run more than once thanks to IF NOT EXISTS.

ALTER TABLE protocols ADD COLUMN IF NOT EXISTS fee_flat         numeric;  -- annual mgmt fee, % of capital,  e.g. 0.5
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS fee_performance  numeric;  -- annual perf fee,  % of yield,    e.g. 10
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS fee_entry        numeric;  -- one-time on subscription, %,     e.g. 0.04
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS fee_exit         numeric;  -- one-time on redemption, %,       e.g. 0.03

-- Refresh PostgREST's schema cache so the new columns are usable immediately.
NOTIFY pgrst, 'reload schema';
