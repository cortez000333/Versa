"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createProtocol,
  updateProtocol,
  deleteProtocol,
} from "@/lib/protocols";
import { Protocol } from "@/lib/data";

// ── Auth ────────────────────────────────────────────────────
export async function login(formData: FormData) {
  const password = formData.get("password") as string;
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login?error=1");
  }
  const jar = await cookies();
  jar.set("versa_admin", process.env.ADMIN_COOKIE_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete("versa_admin");
  redirect("/admin/login");
}

// ── Helpers ─────────────────────────────────────────────────
// Optional number: blank → null (so it shows "—" and won't be saved as 0)
function optNum(f: FormData, key: string): number | null {
  const v = (f.get(key) as string) ?? "";
  if (v.trim() === "") return null;
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : n;
}

function formToProtocol(f: FormData): Omit<Protocol, "id"> {
  return {
    name: (f.get("name") as string) ?? "",
    ticker: (f.get("ticker") as string) ?? "",
    assetClass: (f.get("assetClass") as string) ?? "",
    underlying: (f.get("underlying") as string) ?? "",
    chain: (f.get("chain") as string) ?? "",
    yield: (f.get("yield") as string) ?? "",
    tvl: (f.get("tvl") as string) ?? "",
    price: (f.get("price") as string) ?? "",
    // change / nav / liquidity: deprecated (migration 005) — fields removed from
    // the form and no longer written to the DB; neutral values keep the type happy.
    change: 0,
    nav: 0,
    liquidity: "",
    wrapper: (f.get("wrapper") as string) ?? "",
    protocolUrl: (f.get("protocolUrl") as string) ?? "",
    minInvestment: (f.get("minInvestment") as string) ?? "",
    lockUp: (f.get("lockUp") as string) ?? "",
    eligibility: (f.get("eligibility") as string) ?? "",
    sectionIssuer: (f.get("sectionIssuer") as string) ?? "",
    sectionAssets: (f.get("sectionAssets") as string) ?? "",
    sectionMechanics: (f.get("sectionMechanics") as string) ?? "",
    sectionYield: (f.get("sectionYield") as string) ?? "",
    sectionRedemption: (f.get("sectionRedemption") as string) ?? "",
    monthsLive: "", // deprecated (migration 005) — replaced by issuingDate
    issuingDate: (f.get("issuingDate") as string) ?? "",
    distributionsPaid: (f.get("distributionsPaid") as string) ?? "",
    incidents: (f.get("incidents") as string) ?? "",
    riskCredit: parseInt((f.get("riskCredit") as string) ?? "0") || 0,
    riskLiquidity: parseInt((f.get("riskLiquidity") as string) ?? "0") || 0,
    riskRegulatory: parseInt((f.get("riskRegulatory") as string) ?? "0") || 0,
    riskSmartContract:
      parseInt((f.get("riskSmartContract") as string) ?? "0") || 0,
    riskCustodial: parseInt((f.get("riskCustodial") as string) ?? "0") || 0,

    // ── Scorecard fields (all optional) ──────────────────────
    scoreTransparency: optNum(f, "scoreTransparency"),
    noteTransparency: (f.get("noteTransparency") as string) ?? "",
    scoreLiquidityFriction: optNum(f, "scoreLiquidityFriction"),
    noteLiquidityFriction: (f.get("noteLiquidityFriction") as string) ?? "",
    scoreRealCost: optNum(f, "scoreRealCost"),
    noteRealCost: (f.get("noteRealCost") as string) ?? "",
    scoreTrackRecord: optNum(f, "scoreTrackRecord"),
    noteTrackRecord: (f.get("noteTrackRecord") as string) ?? "",
    scoreCounterparty: optNum(f, "scoreCounterparty"),
    noteCounterparty: (f.get("noteCounterparty") as string) ?? "",
    scoreRegulatory: optNum(f, "scoreRegulatory"),
    noteRegulatory: (f.get("noteRegulatory") as string) ?? "",
    navPerToken: optNum(f, "navPerToken"),
    marketPrice: optNum(f, "marketPrice"),
    headlineYield: optNum(f, "headlineYield"),
    feeDrag: optNum(f, "feeDrag"), // deprecated; no longer in the form, stays null
    feeFlat: optNum(f, "feeFlat"),
    feePerformance: optNum(f, "feePerformance"),
    feeEntry: optNum(f, "feeEntry"),
    feeExit: optNum(f, "feeExit"),
    issuerName: (f.get("issuerName") as string) ?? "",
    tokenStandard: (f.get("tokenStandard") as string) ?? "",
    redemptionTerms: (f.get("redemptionTerms") as string) ?? "",
    settlement: (f.get("settlement") as string) ?? "",
    custodian: (f.get("custodian") as string) ?? "",
    plainRead: (f.get("plainRead") as string) ?? "",
    exitRoutesNote: (f.get("exitRoutesNote") as string) ?? "",
    logoUrl: (f.get("logoUrl") as string) ?? "",
    // Checkboxes share the "suitedForTags" name → collect all checked values
    suitedForTags: f.getAll("suitedForTags").map((v) => String(v)).join(", "),
    suitedForText: (f.get("suitedForText") as string) ?? "",
  };
}

// ── CRUD ─────────────────────────────────────────────────────
export async function createProtocolAction(formData: FormData) {
  const data = formToProtocol(formData);
  if (!data.name.trim()) redirect("/admin/new?error=Name+is+required");
  await createProtocol(data);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProtocolAction(id: number, formData: FormData) {
  const data = formToProtocol(formData);
  if (!data.name.trim()) redirect(`/admin/${id}/edit?error=Name+is+required`);
  await updateProtocol(id, data);
  revalidatePath("/");
  revalidatePath(`/protocol/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProtocolAction(id: number) {
  await deleteProtocol(id);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
