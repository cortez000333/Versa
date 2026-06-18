import type { Metadata } from "next";
import PortfolioTracker from "@/components/PortfolioTracker";

export const metadata: Metadata = {
  title: "Portfolio tracker — Versa",
  description:
    "Enter your tokenized-RWA positions and see true yield, fee drag, concentration, and liquidity — facts, not advice.",
};

export default function TrackerPage() {
  return (
    <div style={{ paddingTop: 40 }}>
      <h1
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: "#EAF0FB",
          margin: "0 0 8px",
          letterSpacing: -0.5,
        }}
      >
        Portfolio tracker
      </h1>
      <p style={{ fontSize: 14, color: "#7E8DA8", margin: "0 0 30px", maxWidth: 640, lineHeight: 1.5 }}>
        Add your tokenized real-world-asset positions to see what they really yield after fees,
        where you&rsquo;re concentrated, and how quickly you could get out. Everything is computed
        from the numbers you enter — no recommendations.
      </p>
      <PortfolioTracker />
    </div>
  );
}
