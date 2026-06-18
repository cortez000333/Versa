import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Versa — RWA Intelligence & Liquidity Discovery",
  description:
    "What exists, what it really yields, and what it costs to get in and out — across every protocol and chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        <Navbar />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px 60px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
