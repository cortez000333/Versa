import { fetchRwaAsset } from "@/lib/rwaData";

// Server-side proxy for the RWA.xyz live fetch. The browser CANNOT call
// app.rwa.xyz directly (cross-origin / CORS), so the tracker (client) calls
// this same-origin route, which runs fetchRwaAsset server-side.
//
// fetchRwaAsset is defensive and never throws — on any failure it returns
// { nav:null, price:null, apy:null, found:false }, which we pass straight
// through. So this route always responds 200 with that shape; the client
// decides how to degrade.

export const runtime = "nodejs"; // need server fetch with custom UA + AbortController
export const dynamic = "force-dynamic"; // always live, never cached

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker") ?? "";
  const data = await fetchRwaAsset(ticker);
  return Response.json(data);
}
