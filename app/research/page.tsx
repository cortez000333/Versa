"use client";

import { useState } from "react";
import { FileText, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ── Brand tokens (mirrors /account + the tracker) ─────────────────
const BG = "#080B16";
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

type ClientType = "individual" | "institutional";

// ── Shared styles ─────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: MUTE,
  display: "block",
  marginBottom: 7,
  letterSpacing: 0.3,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: BG_ELEV,
  border: `1px solid ${LINE}`,
  borderRadius: 9,
  padding: "11px 13px",
  fontSize: 14,
  color: INK,
  outline: "none",
  fontFamily: FONT,
  boxSizing: "border-box",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function ResearchPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [clientType, setClientType] = useState<ClientType>("individual");
  const [asset, setAsset] = useState("");
  const [scope, setScope] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // All text fields filled (trimmed) AND the acknowledgment checked.
  const canSubmit =
    name.trim() !== "" &&
    email.trim() !== "" &&
    asset.trim() !== "" &&
    scope.trim() !== "" &&
    acknowledged &&
    !busy;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Please complete every field and confirm the acknowledgment.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("research_requests").insert({
        name: name.trim(),
        email: email.trim(),
        client_type: clientType,
        asset: asset.trim(),
        scope: scope.trim(),
        acknowledged,
      });
      if (error) {
        // Full error to console for dev diagnosis (RLS / grant / column issues).
        console.error("RESEARCH REQUEST INSERT ERROR:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        throw error;
      }
      // Success — clear the form and show confirmation.
      setName("");
      setEmail("");
      setClientType("individual");
      setAsset("");
      setScope("");
      setAcknowledged(false);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong submitting your request. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: CARD,
    border: `1px solid ${LINE}`,
    borderRadius: 16,
    padding: "26px 28px",
  };

  return (
    <div style={{ fontFamily: FONT, paddingTop: 40, maxWidth: 760 }}>
      {/* ── Header ───────────────────────────────────────────── */}
      <h1
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: INK,
          margin: "0 0 12px",
          letterSpacing: -0.5,
        }}
      >
        Versa Research
      </h1>
      <p style={{ fontSize: 14.5, color: MUTE, margin: "0 0 22px", lineHeight: 1.6 }}>
        Bespoke, independent due-diligence reports on tokenized real-world assets. You tell us the
        asset and what you need to understand; we deliver a detailed written analysis drawn from the
        same rigor behind the Versa scorecard.
      </p>

      {/* ── Disclaimer ───────────────────────────────────────── */}
      <div
        style={{
          background: "#15101C",
          border: `1px solid #3A2A4A`,
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 16,
          fontSize: 12.5,
          color: "#C9B8DA",
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: "#E0CCF0", fontWeight: 700 }}>This is paid research, not investment advice.</span>{" "}
        Our reports provide factual analysis and structured information about an asset. They are not a
        personal recommendation, do not take account of your individual circumstances or objectives,
        and are not a solicitation to buy or sell. Any investment decision is your own.
      </div>

      {/* ── Expectation line ─────────────────────────────────── */}
      <p style={{ fontSize: 12.5, color: FAINT, margin: "0 0 30px", lineHeight: 1.6 }}>
        Reports are priced per engagement and typically delivered within 1–2 weeks. Once you submit a
        request, we&rsquo;ll follow up by email with scope, pricing, and next steps.
      </p>

      {/* ── Form / confirmation ──────────────────────────────── */}
      {done ? (
        <div style={{ ...cardStyle, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              flexShrink: 0,
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#0F2018",
              border: "1px solid #1E4030",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: MINT,
            }}
          >
            <Check size={17} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 5 }}>
              Request received
            </div>
            <div style={{ fontSize: 13.5, color: MUTE, lineHeight: 1.6 }}>
              Thanks — your request has been received. We&rsquo;ll be in touch by email shortly.
            </div>
            <button
              onClick={() => setDone(false)}
              style={{
                marginTop: 16,
                background: "transparent",
                color: BLUE,
                border: `1px solid ${LINE}`,
                borderRadius: 9,
                padding: "9px 14px",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: FONT,
                cursor: "pointer",
              }}
            >
              Submit another request
            </button>
          </div>
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20, color: BLUE }}>
            <FileText size={18} />
            <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>Request a report</span>
          </div>

          {error && (
            <div
              style={{
                background: "#2A1515",
                border: "1px solid #5A2020",
                borderRadius: 10,
                padding: "11px 14px",
                marginBottom: 18,
                fontSize: 13,
                color: CORAL,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Your name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </Field>
            </div>

            <Field label="I am requesting as:">
              <div style={{ display: "flex", gap: 4, background: BG_ELEV, border: `1px solid ${LINE}`, borderRadius: 10, padding: 4 }}>
                {([
                  { v: "individual", label: "An individual" },
                  { v: "institutional", label: "On behalf of an institution / in a professional capacity" },
                ] as { v: ClientType; label: string }[]).map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setClientType(opt.v)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      fontSize: 12.5,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      borderRadius: 7,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: FONT,
                      background: clientType === opt.v ? BLUE : "transparent",
                      color: clientType === opt.v ? "#06101F" : MUTE,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Asset to research">
              <input
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                placeholder="e.g. Ondo USDY, BlackRock BUIDL"
                required
                style={inputStyle}
              />
            </Field>

            <Field label="Scope of the report">
              <textarea
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                required
                rows={5}
                placeholder="Describe what you want the report to cover: the specific questions, risks, or structures you want analyzed."
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              />
            </Field>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                cursor: "pointer",
                fontSize: 12.5,
                color: MUTE,
                lineHeight: 1.5,
              }}
            >
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                required
                style={{ marginTop: 2, accentColor: BLUE, width: 15, height: 15, flexShrink: 0 }}
              />
              <span>
                I understand this is a paid research service providing factual analysis, not investment
                advice, and that any investment decision is my own.
              </span>
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                background: canSubmit ? BLUE : "#1B2740",
                color: canSubmit ? "#06101F" : FAINT,
                border: "none",
                borderRadius: 9,
                padding: "12px",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: FONT,
                cursor: canSubmit ? "pointer" : "default",
                marginTop: 4,
              }}
            >
              {busy ? "Sending…" : "Send request"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
