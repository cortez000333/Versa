import type { Metadata } from "next";
import Link from "next/link";
import { LineChart, Calculator, FileText, LogIn } from "lucide-react";

// ── Brand tokens (mirrors the tracker / research / calculator pages) ──
const CARD = "#111A2E";
const LINE = "#1E2A44";
const BLUE = "#4F8FF7";
const INK = "#EAF0FB";
const MUTE = "#7E8DA8";
const FAINT = "#566179";
const FONT = "var(--font-space-grotesk), 'Space Grotesk', -apple-system, sans-serif";

export const metadata: Metadata = {
  title: "Versa — RWA Intelligence",
  description:
    "Tools and independent research for tokenized real-world assets: see what your portfolio really yields, calculate true yield after fees, and commission bespoke due diligence.",
};

// Each tool gets a card. Extensible: add an entry to grow the grid.
const TOOLS: {
  href: string;
  title: string;
  blurb: string;
  Icon: typeof LineChart;
}[] = [
  {
    href: "/tracker",
    title: "Portfolio Tracker",
    blurb:
      "Add your tokenized-RWA positions and see true yield, fee drag, concentration, and how fast you could get out — facts, not advice.",
    Icon: LineChart,
  },
  {
    href: "/calculator",
    title: "Calculator",
    blurb:
      "Enter an asset's NAV, headline yield, and fees to see what you'd actually earn after costs and entry price — the true yield behind the headline.",
    Icon: Calculator,
  },
  {
    href: "/research",
    title: "Research",
    blurb:
      "Commission a bespoke, independent due-diligence report on a specific tokenized asset — detailed written analysis, delivered to you.",
    Icon: FileText,
  },
];

export default function HomePage() {
  return (
    <div style={{ fontFamily: FONT, paddingTop: 72, maxWidth: 980 }}>
      {/* ── Wordmark ─────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 1, marginBottom: 22 }}>
        <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: 0.5, color: INK }}>VERSA</span>
        <span style={{ color: BLUE, fontSize: 52, fontWeight: 700, lineHeight: 0 }}>.</span>
      </div>

      {/* ── One-line description ─────────────────────────────── */}
      <p style={{ fontSize: 17, color: MUTE, margin: "0 0 28px", lineHeight: 1.6, maxWidth: 620 }}>
        Tools and independent research for tokenized real-world assets — see what you
        really earn, not just the headline number.
      </p>

      {/* ── Account CTA ──────────────────────────────────────── */}
      <div style={{ marginBottom: 50 }}>
        <Link
          href="/account"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: BLUE,
            color: "#fff",
            borderRadius: 10,
            padding: "12px 22px",
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <LogIn size={17} /> Create account / Sign in
        </Link>
        <span style={{ color: FAINT, fontSize: 13.5, marginLeft: 14 }}>
          to save and reload your portfolio
        </span>
      </div>

      {/* ── Tool cards ───────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
        }}
      >
        {TOOLS.map(({ href, title, blurb, Icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "block",
              background: CARD,
              border: `1px solid ${LINE}`,
              borderRadius: 16,
              padding: "24px 24px 26px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: "#0E1424",
                border: `1px solid ${LINE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: BLUE,
                marginBottom: 16,
              }}
            >
              <Icon size={20} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: INK, marginBottom: 8 }}>{title}</div>
            <p style={{ fontSize: 13.5, color: MUTE, margin: 0, lineHeight: 1.6 }}>{blurb}</p>
            <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginTop: 16 }}>
              Open {title} →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
