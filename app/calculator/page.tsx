import type { Metadata } from "next";
import StandaloneCalculator from "@/components/StandaloneCalculator";

export const metadata: Metadata = {
  title: "True-yield calculator — Versa",
  description:
    "Enter any asset's NAV, headline yield, and fees to see what you'd actually earn after costs and entry price — the true yield behind the headline.",
};

export default function CalculatorPage() {
  return (
    <div style={{ paddingTop: 40, maxWidth: 760 }}>
      <h1
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: "#EAF0FB",
          margin: "0 0 8px",
          letterSpacing: -0.5,
        }}
      >
        True-yield calculator
      </h1>
      <p style={{ fontSize: 14, color: "#7E8DA8", margin: "0 0 30px", maxWidth: 640, lineHeight: 1.5 }}>
        Enter an asset&rsquo;s numbers by hand to see what it really yields after fees and your entry
        price. Fill in what you know — every field is optional, and anything that needs a value you
        haven&rsquo;t given simply shows &ldquo;—&rdquo;. Just math on the numbers you provide, no advice.
      </p>
      <StandaloneCalculator />
    </div>
  );
}
