"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Wallet, Plus, Trash2, Save, DownloadCloud } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { Position, RedemptionFrequency } from "@/lib/position";
import {
  computePortfolio,
  classifyLiquidity,
  LIQUIDITY_BUCKETS,
  type LiquidityBucket,
} from "@/lib/portfolioCalc";

// ── Brand tokens (mirrors components/TrueYieldCalculator.tsx) ──────
const CARD = "#111A2E";
const BG_ELEV = "#0E1424";
const LINE = "#1E2A44";
const BLUE = "#4F8FF7";
const MINT = "#35D6A4";
const CORAL = "#F87171";
const INK = "#EAF0FB";
const MUTE = "#7E8DA8";
const FAINT = "#566179";
const FONT = "var(--font-space-grotesk), 'Space Grotesk', -apple-system, sans-serif";

// Colors cycled through the issuer donut + legend.
const PIE_COLORS = [BLUE, MINT, CORAL, "#A78BFA", "#F5B556", "#5BC0BE", "#E879A6", MUTE];

// Bucket → color for the liquidity profile bars.
const BUCKET_COLOR: Record<LiquidityBucket, string> = {
  "≤2 days": MINT,
  "≤1 week": "#5BC0BE",
  "≤1 month": BLUE,
  ">1 month": "#F5B556",
  gated: CORAL,
};

// ── Controlled lists ──────────────────────────────────────────────
const ISSUERS = ["Ondo", "Circle", "BlackRock", "Superstate", "Franklin Templeton", "Other"];
const CHAINS = ["Ethereum", "Solana", "Polygon", "Stellar", "Arbitrum", "Other"];
const ASSET_CLASSES = [
  "Treasury / Money Market",
  "Private Credit",
  "Tokenized Equity",
  "Real Estate",
  "Commodity",
  "Other",
];

// ── Shared styles ─────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: MUTE,
  display: "block",
  marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  border: `1px solid ${LINE}`,
  outline: "none",
  background: BG_ELEV,
  color: INK,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: FONT,
  padding: "9px 11px",
  borderRadius: 9,
};
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "auto" };

// ── Small presentational helpers ──────────────────────────────────
function Stat({
  label,
  value,
  sub,
  color,
  big,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  big?: boolean;
}) {
  return (
    <div style={{ background: BG_ELEV, borderRadius: 11, padding: "12px 13px" }}>
      <div
        style={{
          fontSize: 10.5,
          color: FAINT,
          textTransform: "uppercase",
          letterSpacing: 0.4,
          fontWeight: 600,
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: big ? 22 : 17, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10.5, color: FAINT, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint ? (
        <div style={{ fontSize: 10.5, color: FAINT, marginTop: 5, lineHeight: 1.4 }}>{hint}</div>
      ) : null}
    </div>
  );
}

// A controlled-list select with a free-text "Other" fallback.
function ListField({
  label,
  value,
  otherValue,
  options,
  onChange,
  onOtherChange,
}: {
  label: string;
  value: string;
  otherValue: string;
  options: string[];
  onChange: (v: string) => void;
  onOtherChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {value === "Other" ? (
        <input
          placeholder="Specify…"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          style={{ ...inputStyle, marginTop: 6 }}
        />
      ) : null}
    </Field>
  );
}

// Inline SVG donut — no chart library, matching the project's no-dependency style.
function Donut({
  segments,
  centerTop,
  centerBottom,
}: {
  segments: { label: string; value: number; color: string }[];
  centerTop: string;
  centerBottom: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const size = 150;
  const r = 56;
  const stroke = 22;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {total > 0 ? (
          segments.map((seg, i) => {
            const frac = seg.value / total;
            const dash = frac * c;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return el;
          })
        ) : (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={LINE} strokeWidth={stroke} />
        )}
      </g>
      <text
        x={size / 2}
        y={size / 2 - 4}
        textAnchor="middle"
        style={{ fill: INK, fontSize: 17, fontWeight: 700, fontFamily: FONT }}
      >
        {centerTop}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 13}
        textAnchor="middle"
        style={{ fill: FAINT, fontSize: 10, fontFamily: FONT }}
      >
        {centerBottom}
      </text>
    </svg>
  );
}

// ── Form draft (all strings; parsed on add) ───────────────────────
interface Draft {
  assetName: string;
  issuer: string;
  issuerOther: string;
  chain: string;
  chainOther: string;
  assetClass: string;
  assetClassOther: string;
  amount: string;
  pricePaid: string;
  currentPrice: string;
  nav: string;
  headlineYield: string;
  feeFlat: string;
  feePerformance: string;
  feeEntry: string;
  feeExit: string;
  maturityDate: string;
  holdingPeriodYears: string;
  redemptionFrequency: RedemptionFrequency;
  settlementDays: string;
  lockupUntil: string;
}

const EMPTY_DRAFT: Draft = {
  assetName: "",
  issuer: "Ondo",
  issuerOther: "",
  chain: "Ethereum",
  chainOther: "",
  assetClass: "Treasury / Money Market",
  assetClassOther: "",
  amount: "",
  pricePaid: "",
  currentPrice: "",
  nav: "",
  headlineYield: "",
  feeFlat: "",
  feePerformance: "",
  feeEntry: "",
  feeExit: "",
  maturityDate: "",
  holdingPeriodYears: "1",
  redemptionFrequency: "daily",
  settlementDays: "0",
  lockupUntil: "",
};

function num(s: string, fallback: number): number {
  const t = s.trim();
  if (t === "") return fallback;
  const n = Number(t);
  return Number.isFinite(n) ? n : fallback;
}

// True only for a real calendar date in strict YYYY-MM-DD form. Rejects partial
// input ("2026-06"), bad separators, and impossible dates ("2026-02-31"). Used
// to decide whether the maturity/lockup text fields hold a usable date.
function isValidYmd(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return false;
  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
}

// ── Formatting helpers ────────────────────────────────────────────
const money = (n: number | null) =>
  n == null ? "—" : `$${Math.round(n).toLocaleString()}`;
const pct = (n: number | null, dp = 2) => (n == null ? "—" : `${n.toFixed(dp)}%`);
const signedMoney = (n: number | null) =>
  n == null ? "—" : `${n >= 0 ? "+" : "−"}$${Math.abs(Math.round(n)).toLocaleString()}`;

const FREQ_LABEL: Record<RedemptionFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  atMaturity: "At maturity",
};

function redemptionSummary(p: Position): string {
  const base = `${FREQ_LABEL[p.redemptionFrequency]} · T+${p.settlementDays}`;
  if (p.lockupUntil && new Date(p.lockupUntil).getTime() > Date.now()) {
    return `${base} · locked to ${p.lockupUntil}`;
  }
  return base;
}

// Status banner shown after a save/load attempt.
type Notice = { kind: "success" | "error"; text: string } | null;

const PORTFOLIO_NAME = "My portfolio"; // one-per-user for now; name isn't user-facing yet

export default function PortfolioTracker() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  // ── Auth state (same pattern as /account) ──────────────────────
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // ── Save/load state ────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  // Tracks which user we've already auto-loaded for, so the on-mount
  // auto-load fires once per sign-in (never silently re-overwrites).
  const autoLoadedFor = useRef<string | null>(null);

  const portfolio = useMemo(() => computePortfolio(positions), [positions]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // ── Wire up the live session ───────────────────────────────────
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // Reset auto-load tracking on full sign-out so a later sign-in re-loads.
      if (!s) autoLoadedFor.current = null;
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ── Read the user's saved portfolio from Supabase ──────────────
  // RLS guarantees this only ever returns the signed-in user's own row.
  async function fetchSavedPositions(userId: string): Promise<Position[] | null> {
    const { data, error } = await supabase
      .from("portfolios")
      .select("positions")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null; // no saved portfolio yet
    return (data.positions ?? []) as Position[];
  }

  // ── Manual load (button) ───────────────────────────────────────
  async function loadPortfolio(opts?: { silent?: boolean }) {
    if (!session) return;
    setLoading(true);
    if (!opts?.silent) setNotice(null);
    try {
      const saved = await fetchSavedPositions(session.user.id);
      if (saved == null) {
        if (!opts?.silent) {
          setNotice({ kind: "error", text: "No saved portfolio found yet — add positions and save." });
        }
        return;
      }
      setPositions(saved);
      if (!opts?.silent) {
        setNotice({ kind: "success", text: "Loaded your saved portfolio." });
      }
    } catch (err) {
      setNotice({
        kind: "error",
        text: err instanceof Error ? `Couldn't load: ${err.message}` : "Couldn't load your portfolio.",
      });
    } finally {
      setLoading(false);
    }
  }

  // ── Save (button) — one row per user, handled in app logic ─────
  // Find the user's existing row; UPDATE if present, INSERT if not.
  async function savePortfolio() {
    if (!session) return;
    setSaving(true);
    setNotice(null);
    try {
      const userId = session.user.id;
      const { data: existing, error: selErr } = await supabase
        .from("portfolios")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      if (selErr) throw selErr;

      if (existing) {
        const { error } = await supabase
          .from("portfolios")
          .update({ positions, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("portfolios")
          .insert({ user_id: userId, name: PORTFOLIO_NAME, positions });
        if (error) throw error;
      }
      // Mark this user as handled so we don't auto-load over the save later.
      autoLoadedFor.current = userId;
      setNotice({ kind: "success", text: "Saved to your account." });
    } catch (err) {
      setNotice({
        kind: "error",
        text: err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save your portfolio.",
      });
    } finally {
      setSaving(false);
    }
  }

  // ── Auto-load on mount / sign-in, ONLY when the tracker is empty ─
  // If positions already exist we don't touch them — the user gets a
  // "Load saved portfolio" button instead (never silently overwrite).
  useEffect(() => {
    if (!authReady) return;
    const uid = session?.user.id ?? null;
    if (!uid || autoLoadedFor.current === uid) return;
    autoLoadedFor.current = uid;
    if (positions.length === 0) {
      void loadPortfolio({ silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, session]);

  // Only a *valid* maturity date drives the horizon / shows the derived note;
  // partial or invalid text leaves the holding-period input in play.
  const hasMaturity = isValidYmd(draft.maturityDate);

  function addPosition() {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const resolve = (choice: string, other: string) =>
      choice === "Other" ? other.trim() || "Other" : choice;

    const pos: Position = {
      id,
      assetName: draft.assetName.trim() || "Untitled position",
      issuer: resolve(draft.issuer, draft.issuerOther),
      chain: resolve(draft.chain, draft.chainOther),
      assetClass: resolve(draft.assetClass, draft.assetClassOther),
      amount: num(draft.amount, 0),
      pricePaid: num(draft.pricePaid, 0),
      currentPrice: num(draft.currentPrice, 0),
      nav: draft.nav.trim() === "" ? null : num(draft.nav, 0),
      headlineYield: num(draft.headlineYield, 0),
      feeFlat: num(draft.feeFlat, 0),
      feePerformance: num(draft.feePerformance, 0),
      feeEntry: num(draft.feeEntry, 0),
      feeExit: num(draft.feeExit, 0),
      maturityDate: isValidYmd(draft.maturityDate) ? draft.maturityDate.trim() : null,
      holdingPeriodYears: num(draft.holdingPeriodYears, 1),
      redemptionFrequency: draft.redemptionFrequency,
      settlementDays: num(draft.settlementDays, 0),
      lockupUntil: isValidYmd(draft.lockupUntil) ? draft.lockupUntil.trim() : null,
    };
    setPositions((prev) => [...prev, pos]);
    setDraft(EMPTY_DRAFT);
  }

  function removePosition(id: string) {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  }

  const gap =
    portfolio.blendedHeadlineYield != null && portfolio.blendedTrueYield != null
      ? portfolio.blendedHeadlineYield - portfolio.blendedTrueYield
      : null;

  const donutSegments = portfolio.byIssuer.map((s, i) => ({
    label: s.issuer,
    value: s.currentValue,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    color: FAINT,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: 600,
    marginBottom: 12,
  };
  const cardStyle: React.CSSProperties = {
    background: CARD,
    border: `1px solid ${LINE}`,
    borderRadius: 16,
    padding: "22px 24px",
  };

  const signedIn = !!session;
  const email = session?.user.email ?? "";

  const secondaryBtn: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "transparent",
    color: INK,
    border: `1px solid ${LINE}`,
    borderRadius: 9,
    padding: "9px 14px",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: FONT,
    cursor: "pointer",
  };
  const primaryBtn: React.CSSProperties = {
    ...secondaryBtn,
    background: BLUE,
    color: "#06101F",
    border: "none",
  };

  return (
    <div style={{ fontFamily: FONT }}>
      {/* ── Account / save-load controls ─────────────────────── */}
      {authReady && (
        <div
          style={{
            ...cardStyle,
            padding: "14px 18px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {signedIn ? (
            <>
              <div style={{ fontSize: 12.5, color: MUTE }}>
                Signed in as <span style={{ color: INK, fontWeight: 600 }}>{email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {positions.length > 0 && (
                  <button
                    onClick={() => loadPortfolio()}
                    disabled={loading || saving}
                    style={{ ...secondaryBtn, opacity: loading || saving ? 0.6 : 1 }}
                  >
                    <DownloadCloud size={15} /> {loading ? "Loading…" : "Load saved portfolio"}
                  </button>
                )}
                <button
                  onClick={savePortfolio}
                  disabled={saving || loading}
                  style={{ ...primaryBtn, opacity: saving || loading ? 0.6 : 1 }}
                >
                  <Save size={15} /> {saving ? "Saving…" : "Save portfolio"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: MUTE }}>
              <a href="/account" style={{ color: BLUE, fontWeight: 600, textDecoration: "none" }}>
                Log in
              </a>{" "}
              to save your portfolio to your account.
            </div>
          )}
        </div>
      )}

      {notice && (
        <div
          style={{
            ...cardStyle,
            padding: "11px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: notice.kind === "success" ? MINT : CORAL,
            borderColor: notice.kind === "success" ? "#1E4030" : "#5A2020",
            background: notice.kind === "success" ? "#0F2018" : "#2A1515",
          }}
        >
          {notice.text}
        </div>
      )}

      {/* ── Add position ─────────────────────────────────────── */}
      <div style={sectionLabel}>
        Add a position{" "}
        <span style={{ color: BLUE, textTransform: "none", letterSpacing: 0 }}>
          {signedIn
            ? "· saved to your account"
            : "· session only — refreshing the page clears your portfolio"}
        </span>
      </div>
      <div style={{ ...cardStyle, marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18, color: BLUE }}>
          <Wallet size={18} />
          <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>What do you hold?</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <Field label="Asset name">
            <input
              value={draft.assetName}
              onChange={(e) => set("assetName", e.target.value)}
              placeholder="e.g. USYC"
              style={inputStyle}
            />
          </Field>
          <ListField
            label="Issuer"
            value={draft.issuer}
            otherValue={draft.issuerOther}
            options={ISSUERS}
            onChange={(v) => set("issuer", v)}
            onOtherChange={(v) => set("issuerOther", v)}
          />
          <ListField
            label="Asset class"
            value={draft.assetClass}
            otherValue={draft.assetClassOther}
            options={ASSET_CLASSES}
            onChange={(v) => set("assetClass", v)}
            onOtherChange={(v) => set("assetClassOther", v)}
          />

          <ListField
            label="Chain"
            value={draft.chain}
            otherValue={draft.chainOther}
            options={CHAINS}
            onChange={(v) => set("chain", v)}
            onOtherChange={(v) => set("chainOther", v)}
          />
          <Field label="Tokens held">
            <input
              type="number"
              value={draft.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </Field>
          <Field label="Price paid / token (USD)">
            <input
              type="number"
              step="0.0001"
              value={draft.pricePaid}
              onChange={(e) => set("pricePaid", e.target.value)}
              placeholder="0.00"
              style={inputStyle}
            />
          </Field>

          <Field label="Current price / token (USD)" hint="User-entered in this pass — no live feed yet.">
            <input
              type="number"
              step="0.0001"
              value={draft.currentPrice}
              onChange={(e) => set("currentPrice", e.target.value)}
              placeholder="0.00"
              style={inputStyle}
            />
          </Field>
          <Field label="Current NAV / token (USD)" hint="Optional — drives premium/discount.">
            <input
              type="number"
              step="0.0001"
              value={draft.nav}
              onChange={(e) => set("nav", e.target.value)}
              placeholder="optional"
              style={inputStyle}
            />
          </Field>
          <Field
            label="Headline yield (%)"
            hint="Enter the advertised yield, gross of fees. Versa subtracts fees to show true yield."
          >
            <input
              type="number"
              step="0.01"
              value={draft.headlineYield}
              onChange={(e) => set("headlineYield", e.target.value)}
              placeholder="0.00"
              style={inputStyle}
            />
          </Field>

          <Field label="Flat fee (%/yr)">
            <input
              type="number"
              step="0.01"
              value={draft.feeFlat}
              onChange={(e) => set("feeFlat", e.target.value)}
              placeholder="0.00"
              style={inputStyle}
            />
          </Field>
          <Field label="Performance fee (%)" hint="Charged on gains.">
            <input
              type="number"
              step="0.01"
              value={draft.feePerformance}
              onChange={(e) => set("feePerformance", e.target.value)}
              placeholder="0.00"
              style={inputStyle}
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Entry fee (%)">
              <input
                type="number"
                step="0.01"
                value={draft.feeEntry}
                onChange={(e) => set("feeEntry", e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </Field>
            <Field label="Exit fee (%)">
              <input
                type="number"
                step="0.01"
                value={draft.feeExit}
                onChange={(e) => set("feeExit", e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </Field>
          </div>

          <Field
            label="Maturity date (optional)"
            hint="Leave blank for open-ended funds. Format: YYYY-MM-DD"
          >
            {/* Plain text input, not <input type="date">: Safari autofills native
                date pickers with today and won't let them be cleared. A text input
                starts blank and the browser leaves it alone. We validate the
                YYYY-MM-DD format ourselves (invalid text is cleared on blur). */}
            <input
              type="text"
              autoComplete="off"
              placeholder="YYYY-MM-DD"
              value={draft.maturityDate}
              onChange={(e) => set("maturityDate", e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim() !== "" && !isValidYmd(e.target.value)) {
                  set("maturityDate", "");
                }
              }}
              style={inputStyle}
            />
          </Field>
          <Field label="Intended holding period (yrs)">
            {hasMaturity ? (
              <div style={{ ...inputStyle, color: FAINT, fontWeight: 500 }}>derived from maturity</div>
            ) : (
              <input
                type="number"
                step="0.25"
                value={draft.holdingPeriodYears}
                onChange={(e) => set("holdingPeriodYears", e.target.value)}
                style={inputStyle}
              />
            )}
          </Field>
          <Field label="Redemption frequency">
            <select
              value={draft.redemptionFrequency}
              onChange={(e) => set("redemptionFrequency", e.target.value as RedemptionFrequency)}
              style={selectStyle}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="atMaturity">At maturity</option>
            </select>
          </Field>

          <Field label="Settlement (T+n days)">
            <input
              type="number"
              value={draft.settlementDays}
              onChange={(e) => set("settlementDays", e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </Field>
          <Field
            label="Locked until (optional)"
            hint="Leave blank if none. A future date gates the position. Format: YYYY-MM-DD"
          >
            <input
              type="text"
              autoComplete="off"
              placeholder="YYYY-MM-DD"
              value={draft.lockupUntil}
              onChange={(e) => set("lockupUntil", e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim() !== "" && !isValidYmd(e.target.value)) {
                  set("lockupUntil", "");
                }
              }}
              style={inputStyle}
            />
          </Field>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={addPosition}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                width: "100%",
                background: BLUE,
                color: "#06101F",
                border: "none",
                borderRadius: 9,
                padding: "11px 14px",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: FONT,
                cursor: "pointer",
              }}
            >
              <Plus size={16} /> Add position
            </button>
          </div>
        </div>
      </div>

      {positions.length === 0 ? (
        <div
          style={{
            ...cardStyle,
            textAlign: "center",
            color: MUTE,
            fontSize: 14,
            padding: "40px 24px",
          }}
        >
          No positions yet. Add one above to see your portfolio&rsquo;s true yield, fee drag, and
          liquidity profile.
        </div>
      ) : (
        <>
          {/* ── Portfolio stats ──────────────────────────────── */}
          <div style={sectionLabel}>Portfolio</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginBottom: 26,
            }}
          >
            <Stat
              label="Total invested"
              value={money(portfolio.totalInvested)}
              sub="cost basis"
              color={INK}
            />
            <Stat
              label="Current value"
              value={money(portfolio.totalCurrentValue)}
              sub={`${signedMoney(portfolio.totalGainDollars)} vs cost`}
              color={INK}
              big
            />
            <Stat
              label="Blended true yield"
              value={pct(portfolio.blendedTrueYield)}
              sub={`headline ${pct(portfolio.blendedHeadlineYield)} · gap ${pct(gap, 2)}`}
              color={
                portfolio.blendedTrueYield != null && portfolio.blendedTrueYield < 0 ? CORAL : MINT
              }
              big
            />
            <Stat
              label="Est. annual income"
              value={money(portfolio.estAnnualIncome)}
              sub="gross, at headline"
              color={INK}
            />
            <Stat
              label="Total fee drag / yr"
              value={money(portfolio.totalFeeDragPerYear)}
              sub="headline minus true"
              color={CORAL}
            />
            <Stat
              label="Cost to exit all"
              value={money(portfolio.costToExitAll)}
              sub="exit fees, one-time"
              color={CORAL}
            />
            <Stat
              label="Largest position"
              value={pct(portfolio.largestPositionConcentrationPct, 1)}
              sub="of current value"
              color={INK}
            />
            <Stat
              label="Avg yield-on-cost"
              value={pct(portfolio.weightedAvgYieldOnCost)}
              sub="income ÷ cost basis"
              color={INK}
            />
            <Stat
              label="Positions"
              value={`${portfolio.positionCount}`}
              sub={`${portfolio.issuerCount} issuers · ${portfolio.chainCount} chains`}
              color={INK}
            />
            <Stat
              label="Blended premium/discount"
              value={
                portfolio.blendedPremiumDiscount == null
                  ? "—"
                  : `${portfolio.blendedPremiumDiscount > 0 ? "+" : ""}${portfolio.blendedPremiumDiscount.toFixed(
                      2,
                    )}%`
              }
              sub="to NAV, where known"
              color={
                portfolio.blendedPremiumDiscount != null && portfolio.blendedPremiumDiscount > 0
                  ? CORAL
                  : MINT
              }
            />
          </div>

          {/* ── Composition + liquidity ──────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 26,
            }}
          >
            <div style={cardStyle}>
              <div style={sectionLabel}>Composition by issuer</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Donut
                  segments={donutSegments}
                  centerTop={money(portfolio.totalCurrentValue)}
                  centerBottom="current value"
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                  {donutSegments.map((s) => {
                    const share =
                      portfolio.totalCurrentValue && portfolio.totalCurrentValue > 0
                        ? (s.value / portfolio.totalCurrentValue) * 100
                        : 0;
                    return (
                      <div
                        key={s.label}
                        style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 3,
                            background: s.color,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ color: INK, flex: 1 }}>{s.label}</span>
                        <span style={{ color: MUTE }}>{share.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ fontSize: 11, color: FAINT, marginTop: 12, lineHeight: 1.5 }}>
                Concentration is shown as a neutral fact, not a warning.
              </div>
            </div>

            <div style={cardStyle}>
              <div style={sectionLabel}>Liquidity profile</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {LIQUIDITY_BUCKETS.map((b) => {
                  const value = portfolio.liquidity.pctByBucket[b];
                  return (
                    <div key={b}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ color: INK }}>{b === "gated" ? "Gated / locked" : b}</span>
                        <span style={{ color: MUTE }}>{value.toFixed(1)}%</span>
                      </div>
                      <div style={{ background: BG_ELEV, borderRadius: 5, height: 7 }}>
                        <div
                          style={{
                            width: `${Math.min(100, value)}%`,
                            height: "100%",
                            borderRadius: 5,
                            background: BUCKET_COLOR[b],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: 16,
                  borderTop: `1px solid ${LINE}`,
                  paddingTop: 14,
                }}
              >
                <Stat
                  label="Accessible"
                  value={money(portfolio.liquidity.accessibleAmount)}
                  sub="non-gated value"
                  color={MINT}
                />
                <Stat
                  label="Locked / gated"
                  value={money(portfolio.liquidity.lockedAmount)}
                  sub="not redeemable now"
                  color={CORAL}
                />
              </div>
            </div>
          </div>

          {/* ── Per-position table ───────────────────────────── */}
          <div style={sectionLabel}>Positions</div>
          <div style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: FAINT }}>
                  {[
                    "Asset",
                    "Invested",
                    "Current value",
                    "Price paid",
                    "Current price",
                    "Headline",
                    "True yield",
                    "Income / yr",
                    "Redemption",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "13px 14px",
                        fontWeight: 600,
                        fontSize: 10.5,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        borderBottom: `1px solid ${LINE}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => {
                  const r = portfolio.positions.find((x) => x.id === p.id)!;
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${LINE}` }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ color: INK, fontWeight: 600 }}>{p.assetName}</div>
                        <div style={{ color: FAINT, fontSize: 10.5 }}>
                          {p.issuer} · {p.chain}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", color: MUTE }}>{money(r.investedValue)}</td>
                      <td style={{ padding: "12px 14px", color: INK, fontWeight: 600 }}>
                        {money(r.currentValue)}
                      </td>
                      <td style={{ padding: "12px 14px", color: MUTE }}>
                        ${p.pricePaid.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td style={{ padding: "12px 14px", color: MUTE }}>
                        ${p.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td style={{ padding: "12px 14px", color: MUTE }}>{pct(p.headlineYield)}</td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontWeight: 700,
                          color: r.trueYield < 0 ? CORAL : MINT,
                        }}
                      >
                        {pct(r.trueYield)}
                      </td>
                      <td style={{ padding: "12px 14px", color: INK }}>
                        {money(r.grossIncomePerYear)}
                      </td>
                      <td style={{ padding: "12px 14px", color: MUTE, whiteSpace: "nowrap" }}>
                        {redemptionSummary(p)}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          onClick={() => removePosition(p.id)}
                          aria-label="Remove position"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: FAINT,
                            cursor: "pointer",
                            padding: 4,
                            display: "flex",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, fontSize: 11.5, color: FAINT, lineHeight: 1.5 }}>
            All figures are deterministic math on the numbers you entered — facts, not advice.
            Current price is user-entered in this pass; a live price feed comes next.
          </div>
        </>
      )}
    </div>
  );
}
