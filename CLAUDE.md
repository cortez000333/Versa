@AGENTS.md

# Versa — Project Status

## Strategic direction (pivot — June 2026)
**The model has changed.** Versa is moving *away* from being a manually-maintained scorecard database — keeping a full market database current is too much data burden for a solo founder. The new shape has three pillars:

1. **User-fed tools = the scalable core.** The user brings their own data; Versa does the math and the framing. No DB to maintain.
   - **True-yield calculator** — *done* (`components/TrueYieldCalculator.tsx`).
   - **Portfolio tracker** — *next build* (spec below).
   - **Alerts** — later.
2. **Paid research-on-demand = the money.** This monetizes Alessandro's *judgment*, not a database: bespoke due-diligence reports on a specific asset, sold one at a time. **Framed as research, not advice** (no recommendations, no "buy/sell").
3. **Scorecard showcase = credibility, not coverage.** Keep only a small, hand-curated **3–5 asset** public scorecard set as proof of rigor. This is a showcase, *not* a market database to keep complete.

**Scope guardrail:** focus on **institutional, API-covered assets** (Ondo, Circle, BlackRock, etc.) — things with reliable public data, so the tools stay accurate without manual upkeep.

**Decided AGAINST (and why — don't revive these):**
- *AI-generated scores* — destroys the moat (the human judgment is the product) and carries hallucination risk.
- *Live yield feeds* — would require the pricier RWA.xyz API; not worth it yet.
- *A screener as originally conceived* — secretly depends on a maintained DB, which is exactly the burden we're escaping.

### Portfolio tracker — build spec (the next thing to build)
**One live input only:** current price / NAV via **CoinGecko free tier**. Everything else is static / user-entered: amount, price paid, headline yield, fees (flat / performance / entry / exit), redemption & settlement terms, asset class, chain, issuer.

**Outputs — all deterministic, no advice, just facts and math:**
- Total invested + current value
- Blended true yield (across the whole portfolio)
- Total real cost / fee drag
- Estimated annual income
- Headline-vs-true-yield gap
- Composition breakdown (concentration stated as a *neutral fact*, not a warning)
- Per-position true yield
- Redemption / liquidity profile
- *Possible additions:* yield-on-cost, cost-to-exit-everything

**Build in two passes:** (1) the **calculation engine first**, running entirely on user-entered numbers; (2) **then wire in the live CoinGecko price**. Reuse the true-yield math already in `TrueYieldCalculator.tsx` where possible.

## What's built
- Next.js 16 app with TypeScript, Tailwind CSS, Space Grotesk font
- Market dashboard (`/`) — reads live from Supabase, with search and asset-class filters. Table columns are `# · Protocol · Asset class · Chain · Net yield · TVL · Price` (the **24h**, **vs NAV**, and **Liquidity** columns were removed in the migration-005 cleanup to keep the table clean).
- **Scorecard page (`/protocol/[id]`)** — the asset detail page, rebuilt as a "scorecard" (replaced the old basic detail view). Shows: a header with the asset **logo** (image, falling back to a 2-letter placeholder square) and name — **no ticker/class/chain pills** (removed as redundant; the facts panel below carries that info), objective asset-facts strip (incl. separate **Redemption** and **Settlement** facts — see migration 005), "the plain read" summary, six proprietary scores (Transparency, Redemption/Liquidity Friction, Real Cost, Track Record, Counterparty/Backing, Regulatory Clarity) as BOTH a radar chart and detail cards, a composite Versa Score donut (average of the filled scores), a "suited for" panel, a true-yield calculator, and an exit-routes note. All data comes from the DB; empty fields show "—" or hide gracefully (no crashes).
- **True-yield calculator** (`components/TrueYieldCalculator.tsx`, client component) — inputs are amount invested + price paid per token; it DERIVES premium/discount and true yield from the asset's NAV, headline yield, and the structured fee model (flat / performance / entry / exit). Hidden (with a notice) when NAV + headline yield aren't set.
- **Portfolio tracker — Pass 1 DONE** (`/tracker`). The new flagship user-fed tool from the pivot. **Entirely session-based and user-entered — NO Supabase, NO external API** (current price is typed in this pass; live CoinGecko price is Pass 2). Positions live in React state only; a refresh clears them (expected).
  - **Deliberately decoupled from the DB-backed `Protocol` type.** Uses its own lightweight `Position` type (`lib/position.ts`) — no snake_case mappers, nothing persisted.
  - **Pure calc engine** in `lib/portfolioCalc.ts` (no React/UI): per-position true yield, fee drag, annualized gain, premium/discount; and portfolio rollups — total invested/current value, blended true yield, weighted avg yield-on-cost, est. annual income, total fee drag $/yr, cost-to-exit-all, largest-position concentration, blended premium/discount, issuer/chain counts, and a liquidity-bucket profile (≤2 days / ≤1 week / ≤1 month / >1 month / gated). Every division is guarded so empty/zero inputs return `null` → "—", never NaN.
  - **UI** (`components/PortfolioTracker.tsx`, client) mirrors the calculator's conventions exactly (same brand-token constants, inline styling, `<Stat>` subcomponent). Add-position form (issuer/chain/class are controlled lists + "Other"), stat-card grid, an inline-SVG issuer donut (no chart lib), a per-position table (negative true yield shown in CORAL), and a liquidity-profile section. Outputs are deterministic facts, **no advice**.
  - **Horizon rule:** only a *valid future* maturity date drives the holding horizon; otherwise the "Intended holding period (yrs)" number (default 1) is used. A today/past/blank maturity is ignored — this was the fix for an earlier "true yield = −296.5%" bug (a today maturity had collapsed the horizon to a 0.01yr floor, ~100×-ing every fee-drag term).
  - **Date inputs are plain TEXT fields in `YYYY-MM-DD` format, NOT `<input type="date">`** — Safari autofills native date pickers with today and won't let them clear. Text fields start blank; a small `isValidYmd()` validates the format (invalid text is cleared on blur), and blank/invalid saves as `null`.
- Admin panel (`/admin`) — password-protected, full add / edit / delete. The form includes ALL scorecard fields plus a **Logo URL** field, grouped into sections: Market data, Scorecard — Facts, Calculator inputs, Scores & notes (0–10), Narrative, Suited for. **The save path fully reads AND writes all columns** (verified end-to-end); all new fields are optional and blanks save as null (not 0).
- Supabase (PostgreSQL) database. Schema built up via additive migrations in `db/migrations/`: `001_scorecard_columns.sql` (12 score+note cols, 4 calculator numbers, 4 facts, 2 narrative), `002_suited_for.sql` (suited-for tags + text), `003_fee_model.sql` (structured fees — `fee_flat`/`fee_performance`/`fee_entry`/`fee_exit`, replacing the deprecated `fee_drag`), `004_logo_url.sql` (`logo_url`), `005_redemption_settlement_issuing.sql` (`settlement`, `issuing_date`). All are `ADD COLUMN IF NOT EXISTS` and end with `NOTIFY pgrst, 'reload schema'`. **All migrations through 005 have been run in Supabase (the `settlement` and `issuing_date` columns are confirmed live).**
  - **Deprecated columns, left in place but no longer read/written by the app** (so existing values are preserved, not zeroed): `risk_*`, `fee_drag`, `liquidity`, `change_24h`, `vs_nav`, `months_live`.
  - **Migration 005 cleanup:** the dashboard **Liquidity** column and the form's **Liquidity / 24h change / vs NAV** fields were retired. The facts panel now carries two separate facts — **Redemption** (reuses the existing `redemption_terms` column, so old values survive) and **Settlement** (new `settlement` column). Track Record shows **Issuing date** (`issuing_date`, free-form text e.g. "March 2023", with a best-effort "~N yr live" elapsed suffix computed in `page.tsx`) instead of months-live.
  - **If a future migration adds another written column, run it in the Supabase SQL editor before saving in admin** — the save path writes every mapped column, so a missing column makes admin saves fail.
- RLS enabled, GRANT ALL on the table for all three roles, SELECT policy for anon — all configured and working

## Current data
- The original "Ondo OUSG" row and the `[DEMO]` id-2 row are gone. The data has moved on past the demo: real-looking assets now exist at **id 3 and id 4** (both confirmed in the DB this session; their new `settlement`/`issuing_date` start as null until filled in via admin). Verify the live table in Supabase / `/admin` for the current set.

## What's next (in order — reprioritized for the pivot)
1. **Portfolio tracker — Pass 1 is DONE** (see What's built). **Next: Pass 2 — wire the live CoinGecko free-tier price** into `currentPrice` (replace the user-entered field with a fetched price; keep everything else user-entered). Possible later additions: yield-on-cost is already shown; still open are cost-to-exit-everything polish and a nav link to `/tracker` (the page exists but isn't in the navbar yet).
2. **Curate the scorecard showcase down to 3–5 institutional assets** (Ondo, Circle, BlackRock, etc.). Finish the USYC review as part of this — but only as one of the showcase pieces, no longer a push toward 8–10:
   - Fix `headline_yield` from **4.3 → 3.13** (after this, the true yield should read **~2.82%**).
   - Confirm `token_standard` (**"ERC-20, SPL"**) and the regulatory wrapper (**"Reg S"**) read as **distinct** fields — not merged/duplicated.
   - Verify USYC's **other fields hold their final corrected values**.
3. **Stand up the paid research-on-demand offering** — a way to request/pay for a bespoke due-diligence report (framed as research, not advice). Form/intake + delivery; the report itself is hand-written.
4. **Alerts** — user-configured notifications on their tracked positions (after the tracker is live).
5. Add a **delete-confirmation dialog** to the admin panel (currently delete is immediate).
6. **Tidy the deprecated middleware warning** — Next.js 16 wants `middleware.ts` renamed to `proxy` (the startup warning still fires; harmless, the app runs fine).
7. Deploy to Vercel (connect the GitHub repo, add env vars in Vercel dashboard).

> **Note:** the old roadmap's "full market database" and "live data automation that pulls every asset on a schedule" goals are **retired** — they're the data burden the pivot exists to avoid. The admin panel / Supabase scorecard now serves only the small curated showcase.

## Key files to know
- `lib/protocols.ts` — all database read/write functions
- `lib/data.ts` — Protocol TypeScript interface + DB row mappers
- `lib/supabase.ts` — single Supabase client using the secret key (server-side only)
- `app/admin/_actions.ts` — server actions for login, logout, and protocol CRUD (incl. scorecard fields; `optNum` helper keeps blank numbers as null)
- `app/protocol/[id]/page.tsx` — the scorecard page (server component; inline radar/donut/bar SVG helpers)
- `components/TrueYieldCalculator.tsx` — interactive calculator (client component, serializable number props)
- `lib/position.ts` — the session-only `Position` type for the portfolio tracker (NOT the DB-backed `Protocol`; nothing persisted)
- `lib/portfolioCalc.ts` — pure portfolio math (no React/UI): `computePosition`, `computePortfolio`, `classifyLiquidity`; all divisions guarded against NaN
- `components/PortfolioTracker.tsx` — the `/tracker` UI (client component); add-position form, stat cards, inline-SVG issuer donut, per-position table, liquidity profile; date fields are YYYY-MM-DD text inputs (Safari-autofill-proof, validated by a local `isValidYmd` helper)
- `app/tracker/page.tsx` — the portfolio tracker page (server component wrapper around `PortfolioTracker`)
- `components/ProtocolForm.tsx` — shared form used by both /admin/new and /admin/[id]/edit (incl. the Logo URL field)
- `components/DashboardClient.tsx` — the market dashboard table (client component; renders the logo / letter-placeholder per row)
- `db/migrations/` — additive SQL migrations, run in order in the Supabase SQL editor: `001_scorecard_columns.sql`, `002_suited_for.sql`, `003_fee_model.sql`, `004_logo_url.sql`, `005_redemption_settlement_issuing.sql`
- `.env.local` — Supabase URL + secret key + admin password (git-ignored, never commit)
