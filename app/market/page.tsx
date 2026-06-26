import type { Metadata } from "next";
import { getProtocols } from "@/lib/protocols";
import DashboardClient from "@/components/DashboardClient";

// The market dashboard. Preserved and fully functional, but intentionally NOT
// linked in the public nav — it returns later with the marketplace. Moved here
// from app/page.tsx (now the landing page) on the three-tool reshape.
export const revalidate = 60; // re-fetch from DB at most once per minute

export const metadata: Metadata = {
  title: "Market — Versa",
  description:
    "What exists, what it really yields, and what it costs to get in and out — across every protocol and chain.",
};

export default async function MarketPage() {
  const protocols = await getProtocols();
  return <DashboardClient protocols={protocols} />;
}
