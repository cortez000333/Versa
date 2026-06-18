import { getProtocols } from "@/lib/protocols";
import DashboardClient from "@/components/DashboardClient";

export const revalidate = 60; // re-fetch from DB at most once per minute

export default async function HomePage() {
  const protocols = await getProtocols();
  return <DashboardClient protocols={protocols} />;
}
