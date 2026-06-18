import Link from "next/link";
import { getAllProtocolsAdmin } from "@/lib/protocols";
import DeleteProtocolButton from "@/components/DeleteProtocolButton";

const CARD      = "#111A2E";
const CARD_HOVER = "#16203A";
const LINE      = "#1E2A44";
const BLUE      = "#4F8FF7";
const BLUE_SOFT = "#16233F";
const MINT      = "#35D6A4";
const CORAL     = "#F87171";
const INK       = "#EAF0FB";
const MUTE      = "#7E8DA8";
const FAINT     = "#566179";

export default async function AdminPage() {
  const protocols = await getAllProtocolsAdmin();

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: INK, margin: "0 0 4px", letterSpacing: -0.4 }}>
            Protocols
          </h1>
          <p style={{ fontSize: 13.5, color: MUTE, margin: 0 }}>
            {protocols.length} protocol{protocols.length !== 1 ? "s" : ""} in the database
          </p>
        </div>
        <Link
          href="/admin/new"
          style={{
            background: BLUE, color: "#fff", textDecoration: "none",
            borderRadius: 9, padding: "10px 18px", fontSize: 13.5,
            fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 7,
          }}
        >
          + Add protocol
        </Link>
      </div>

      {/* Table */}
      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, overflow: "hidden" }}>
        {protocols.length === 0 ? (
          <div style={{ padding: "60px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 15, color: MUTE, marginBottom: 16 }}>No protocols yet.</div>
            <Link href="/admin/new" style={{ color: BLUE, textDecoration: "none", fontWeight: 600 }}>
              Add your first protocol →
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "#0E1424", borderBottom: `1px solid ${LINE}` }}>
                  {["ID", "Name", "Ticker", "Asset class", "Chain", "Net yield", "TVL", "Price", "Actions"].map((h, i) => (
                    <th key={h} style={{
                      textAlign: i < 4 ? "left" : "right",
                      padding: "12px 16px", fontSize: 10.5, fontWeight: 700,
                      color: FAINT, textTransform: "uppercase", letterSpacing: 0.7, whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {protocols.map((p) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: `1px solid ${LINE}` }}
                  >
                    <td style={{ padding: "14px 16px", color: FAINT }}>{p.id}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: BLUE_SOFT, border: `1px solid #26406E`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: BLUE, fontWeight: 700, fontSize: 12, flexShrink: 0,
                        }}>
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: INK }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: MUTE }}>{p.ticker || "—"}</td>
                    <td style={{ padding: "14px 16px", color: MUTE }}>{p.assetClass || "—"}</td>
                    <td style={{ padding: "14px 16px", textAlign: "right", color: INK }}>{p.chain || "—"}</td>
                    <td style={{ padding: "14px 16px", textAlign: "right", color: MINT, fontWeight: 700 }}>{p.yield || "—"}</td>
                    <td style={{ padding: "14px 16px", textAlign: "right", color: INK }}>{p.tvl || "—"}</td>
                    <td style={{ padding: "14px 16px", textAlign: "right", color: INK }}>{p.price || "—"}</td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Link
                          href={`/admin/${p.id}/edit`}
                          style={{
                            background: BLUE_SOFT, border: `1px solid #26406E`,
                            color: BLUE, textDecoration: "none", borderRadius: 7,
                            padding: "6px 12px", fontSize: 12.5, fontWeight: 600,
                          }}
                        >
                          Edit
                        </Link>
                        <DeleteProtocolButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
