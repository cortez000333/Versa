"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Flame, Sparkles, BarChart3,
} from "lucide-react";
import { Protocol } from "@/lib/data";

// ── Brand tokens ──────────────────────────────────────────────
const BG_ELEV    = "#0E1424";
const CARD       = "#111A2E";
const CARD_HOVER = "#16203A";
const LINE       = "#1E2A44";
const BLUE       = "#4F8FF7";
const BLUE_SOFT  = "#16233F";
const MINT       = "#35D6A4";
const INK        = "#EAF0FB";
const MUTE       = "#7E8DA8";
const FAINT      = "#566179";

const ASSET_FILTERS = [
  "All Assets", "Real Estate", "Commodities", "Gov. Securities",
  "Money Market", "Equities", "Private Credit", "Bonds",
];

function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "warn";
}) {
  const tones = {
    default: { bg: BLUE_SOFT, fg: MUTE,     bd: LINE },
    accent:  { bg: BLUE_SOFT, fg: BLUE,     bd: "#26406E" },
    warn:    { bg: "#2A2113", fg: "#E0B354", bd: "#3D3115" },
  };
  const t = tones[tone];
  return (
    <span style={{
      background: t.bg, color: t.fg, fontSize: 11, fontWeight: 600,
      padding: "3px 9px", borderRadius: 7, letterSpacing: 0.2,
      whiteSpace: "nowrap", border: `1px solid ${t.bd}`,
    }}>
      {children}
    </span>
  );
}

interface HighlightItem {
  name: string; meta: string; dot: string;
  val: string; sub: string; valColor: string;
}

function HighlightCol({
  icon, title, accent, items,
}: {
  icon: React.ReactNode; title: string;
  accent: string; items: HighlightItem[];
}) {
  return (
    <div style={{ flex: 1, minWidth: 280 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ color: accent }}>{icon}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2, color: MUTE, textTransform: "uppercase" }}>
          {title}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: FAINT, fontSize: 13, width: 10, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
            <div style={{ width: 7, height: 7, borderRadius: 99, background: it.dot }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{it.name}</div>
              <div style={{ fontSize: 11.5, color: FAINT }}>{it.meta}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: it.valColor }}>{it.val}</div>
              <div style={{ fontSize: 11, color: FAINT }}>{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PLACEHOLDER_ITEMS: HighlightItem[] = [
  { name: "—", meta: "—", dot: BLUE,      val: "—", sub: "", valColor: MUTE },
  { name: "—", meta: "—", dot: MINT,      val: "—", sub: "", valColor: MUTE },
  { name: "—", meta: "—", dot: "#C084FC", val: "—", sub: "", valColor: MUTE },
];

export default function DashboardClient({ protocols }: { protocols: Protocol[] }) {
  const router = useRouter();
  const [asset, setAsset] = useState("All Assets");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return protocols.filter((p) => {
      const matchesFilter = asset === "All Assets" || p.assetClass === asset;
      const matchesSearch =
        q === "" ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.ticker.toLowerCase().includes(q.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [protocols, asset, q]);

  // Build highlight lists from live data
  const topYield: HighlightItem[] = protocols
    .filter((p) => p.yield && p.yield !== "—")
    .sort((a, b) => parseFloat(b.yield) - parseFloat(a.yield))
    .slice(0, 3)
    .map((p, i) => ({
      name: p.name, meta: `${p.assetClass} · ${p.chain}`,
      dot: [BLUE, MINT, "#C084FC"][i], val: p.yield,
      sub: "net yield", valColor: MINT,
    }));

  const newest: HighlightItem[] = [...protocols]
    .slice(-3)
    .reverse()
    .map((p, i) => ({
      name: p.name, meta: `${p.assetClass} · ${p.chain}`,
      dot: [BLUE, MINT, "#C084FC"][i], val: p.yield !== "—" ? p.yield : "New",
      sub: "net yield", valColor: p.yield !== "—" ? MINT : MUTE,
    }));

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "32px 0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Pill tone="accent">RWA Intelligence</Pill>
          <span style={{ fontSize: 12, color: FAINT }}>Prices live · structure reviewed quarterly</span>
        </div>
        <h1 style={{ fontSize: 34, lineHeight: 1.08, margin: "0 0 8px", color: INK, fontWeight: 700, letterSpacing: -0.8 }}>
          The market for tokenized real-world assets
        </h1>
        <p style={{ fontSize: 15, color: MUTE, margin: 0, maxWidth: 600, lineHeight: 1.5 }}>
          What exists, what it really yields, and what it costs to get in and out — across every protocol and chain.
        </p>
      </div>

      {/* Highlights */}
      <div style={{
        display: "flex", gap: 40, flexWrap: "wrap",
        background: BG_ELEV, border: `1px solid ${LINE}`,
        borderRadius: 16, padding: "22px 26px", marginBottom: 22,
      }}>
        <HighlightCol icon={<Flame size={15} />}     title="Trending Assets" accent="#FB923C" items={protocols.length ? rows.slice(0, 3).map((p, i) => ({ name: p.name, meta: `${p.assetClass} · ${p.chain}`, dot: [BLUE, MINT, "#C084FC"][i] ?? BLUE, val: p.yield !== "—" ? p.yield : "—", sub: "net yield", valColor: MINT })) : PLACEHOLDER_ITEMS} />
        <div style={{ width: 1, background: LINE }} />
        <HighlightCol icon={<Sparkles size={15} />}  title="Newly Added"     accent={BLUE}    items={newest.length ? newest : PLACEHOLDER_ITEMS} />
        <div style={{ width: 1, background: LINE }} />
        <HighlightCol icon={<BarChart3 size={15} />} title="Top Yield"       accent={MINT}    items={topYield.length ? topYield : PLACEHOLDER_ITEMS} />
      </div>

      {/* Filters + search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
          {ASSET_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setAsset(f)}
              style={{
                background: asset === f ? BLUE_SOFT : "transparent",
                border: asset === f ? `1px solid #26406E` : "1px solid transparent",
                color: asset === f ? BLUE : MUTE,
                borderRadius: 9, padding: "8px 14px",
                fontSize: 13.5, fontWeight: 600, cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: CARD, border: `1px solid ${LINE}`,
          borderRadius: 10, padding: "9px 13px", minWidth: 220,
        }}>
          <Search size={15} color={FAINT} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            style={{
              border: "none", outline: "none", fontSize: 13.5,
              width: "100%", color: INK, background: "transparent",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: BG_ELEV, borderBottom: `1px solid ${LINE}` }}>
                {["#", "Protocol", "Asset class", "Chain", "Net yield", "TVL", "Price"].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i < 2 ? "left" : "right",
                    padding: "13px 16px", fontSize: 10.5, fontWeight: 700,
                    color: FAINT, textTransform: "uppercase", letterSpacing: 0.7, whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: MUTE, fontSize: 14 }}>
                    {protocols.length === 0
                      ? "No protocols yet — add some in the admin panel."
                      : "No protocols match your filter."}
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/protocol/${r.id}`)}
                    style={{ borderBottom: `1px solid ${LINE}`, cursor: "pointer", transition: "background .12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = CARD_HOVER)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "15px 16px", color: FAINT, fontVariantNumeric: "tabular-nums" }}>{idx + 1}</td>
                    <td style={{ padding: "15px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {r.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.logoUrl}
                            alt={`${r.name} logo`}
                            style={{
                              width: 36, height: 36, borderRadius: 9,
                              objectFit: "cover", background: BLUE_SOFT,
                              border: `1px solid #26406E`, flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: 9,
                            background: BLUE_SOFT, border: `1px solid #26406E`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: BLUE, fontWeight: 700, fontSize: 13, flexShrink: 0,
                          }}>
                            {r.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: INK }}>{r.name}</div>
                          <div style={{ fontSize: 12, color: FAINT }}>{r.ticker} · {r.underlying}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "15px 16px", textAlign: "right" }}><Pill>{r.assetClass}</Pill></td>
                    <td style={{ padding: "15px 16px", textAlign: "right", color: INK }}>{r.chain}</td>
                    <td style={{ padding: "15px 16px", textAlign: "right", fontWeight: 700, color: MINT, fontVariantNumeric: "tabular-nums" }}>{r.yield}</td>
                    <td style={{ padding: "15px 16px", textAlign: "right", color: INK, fontVariantNumeric: "tabular-nums" }}>{r.tvl}</td>
                    <td style={{ padding: "15px 16px", textAlign: "right", color: INK, fontVariantNumeric: "tabular-nums" }}>{r.price}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {protocols.length > 0 && (
          <div style={{
            padding: "14px 16px", textAlign: "center", fontSize: 13, color: FAINT,
            borderTop: `1px solid ${LINE}`, background: BG_ELEV,
          }}>
            Showing {rows.length} of {protocols.length} protocol{protocols.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
