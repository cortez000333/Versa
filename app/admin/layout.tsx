import Link from "next/link";
import { logout } from "@/app/admin/_actions";

const BG_ELEV = "#0E1424";
const LINE    = "#1E2A44";
const BLUE    = "#4F8FF7";
const INK     = "#EAF0FB";
const MUTE    = "#7E8DA8";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav style={{
        borderBottom: `1px solid ${LINE}`,
        background: BG_ELEV,
        padding: "13px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: INK, letterSpacing: 0.5 }}>
              VERSA<span style={{ color: BLUE }}>.</span>
            </span>
          </Link>
          <span style={{ color: LINE, fontSize: 18 }}>|</span>
          <Link href="/admin" style={{ fontSize: 13.5, fontWeight: 600, color: BLUE, textDecoration: "none" }}>
            Admin
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/"
            style={{ fontSize: 13, color: MUTE, textDecoration: "none" }}
          >
            ← View live site
          </Link>
          <form action={logout}>
            <button type="submit" style={{
              background: "transparent", border: `1px solid ${LINE}`,
              borderRadius: 8, padding: "7px 13px", fontSize: 13,
              color: MUTE, cursor: "pointer",
            }}>
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 28px 80px" }}>
        {children}
      </div>
    </>
  );
}
