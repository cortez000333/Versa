// ── RWA.xyz live-data fetch (Step 1 of tracker live data) ──────────────
//
// SERVER-SIDE ONLY. The fetch to app.rwa.xyz is cross-origin and would be
// CORS-blocked in the browser. Call this from a server context only.
//
// Strategy: fetch the asset's public page HTML, pull the JSON embedded in the
// <script id="__NEXT_DATA__"> tag, and read three values from
// props.pageProps.asset:
//   net_asset_value_dollar.val  → NAV  (dollars per token)
//   price_dollar.val            → price (dollars per token)
//   apy_7_day.val               → 7-day APY
//
// Defensive by design: ANY failure (network, timeout, missing tag, shape change,
// unknown ticker, missing field) degrades to null — this function NEVER throws.
// Each of the three fields is independently optional.

export interface RwaAssetData {
  nav: number | null;
  price: number | null;
  apy: number | null;
  found: boolean; // true only if the asset page + asset JSON were parsed
}

const TIMEOUT_MS = 10_000;

// Pull a finite number out of a `{ val: ... }` field, else null. Tolerates the
// field being absent, the value being a numeric string, null, NaN, etc.
function readVal(field: unknown): number | null {
  if (field == null || typeof field !== "object") return null;
  const raw = (field as { val?: unknown }).val;
  if (raw == null) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function fetchRwaAsset(ticker: string): Promise<RwaAssetData> {
  const miss: RwaAssetData = { nav: null, price: null, apy: null, found: false };

  const clean = (ticker ?? "").trim().toUpperCase();
  if (!clean) return miss;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`https://app.rwa.xyz/assets/${encodeURIComponent(clean)}`, {
      signal: controller.signal,
      headers: {
        // A browser-like UA reduces the chance of being served a bot wall.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });
    if (!res.ok) return miss;

    const html = await res.text();

    // Extract the JSON inside <script id="__NEXT_DATA__" ...>...</script>.
    const match = html.match(
      /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
    );
    if (!match) return miss;

    let data: unknown;
    try {
      data = JSON.parse(match[1]);
    } catch {
      return miss;
    }

    // Walk to props.pageProps.asset defensively.
    const asset = (data as Record<string, unknown> | null)
      ?.["props"] as Record<string, unknown> | undefined;
    const pageProps = asset?.["pageProps"] as Record<string, unknown> | undefined;
    const a = pageProps?.["asset"] as Record<string, unknown> | undefined;
    if (!a || typeof a !== "object") return miss;

    // The asset JSON exists → found. Each field is independently optional.
    return {
      nav: readVal(a["net_asset_value_dollar"]),
      price: readVal(a["price_dollar"]),
      apy: readVal(a["apy_7_day"]),
      found: true,
    };
  } catch {
    // Network error, timeout/abort, anything unexpected → graceful nulls.
    return miss;
  } finally {
    clearTimeout(timer);
  }
}
