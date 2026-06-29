import Link from "next/link";
import { LogIn } from "lucide-react";

const LINE = "#1E2A44";
const BLUE = "#4F8FF7";
const INK = "#EAF0FB";

export default function Navbar() {
  return (
    <nav style={{
      borderBottom: `1px solid ${LINE}`,
      background: "rgba(8,11,22,.8)",
      backdropFilter: "blur(10px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "15px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: 1, textDecoration: "none" }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.5, color: INK }}>VERSA</span>
            <span style={{ color: BLUE, fontSize: 26, fontWeight: 700, lineHeight: 0 }}>.</span>
          </Link>
          <div style={{ display: "flex", gap: 26, fontSize: 14 }}>
            <Link href="/tracker" style={{ color: INK, fontWeight: 600, textDecoration: "none" }}>Portfolio Tracker</Link>
            <Link href="/calculator" style={{ color: INK, fontWeight: 600, textDecoration: "none" }}>Calculator</Link>
            <Link href="/research" style={{ color: INK, fontWeight: 600, textDecoration: "none" }}>Research</Link>
          </div>
        </div>
        <Link href="/account" style={{
          background: BLUE,
          color: "#fff",
          border: "none",
          borderRadius: 9,
          padding: "9px 17px",
          fontSize: 13.5,
          fontWeight: 700,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}>
          <LogIn size={15} /> Sign in
        </Link>
      </div>
    </nav>
  );
}
