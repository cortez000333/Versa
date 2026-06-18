import { supabaseAdmin } from "./supabase";
import { Protocol, rowToProtocol, protocolToRow } from "./data";

export async function getProtocols(): Promise<Protocol[]> {
  const { data, error } = await supabaseAdmin
    .from("protocols")
    .select("*")
    .order("id");
  if (error) {
    console.error("getProtocols error:", error);
    return [];
  }
  return (data ?? []).map(rowToProtocol);
}

export async function getProtocol(id: number): Promise<Protocol | null> {
  const { data, error } = await supabaseAdmin
    .from("protocols")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return rowToProtocol(data);
}

// Admin-only functions — use the secret key client

export async function getAllProtocolsAdmin(): Promise<Protocol[]> {
  const { data, error } = await supabaseAdmin
    .from("protocols")
    .select("*")
    .order("id");
  if (error) throw error;
  return (data ?? []).map(rowToProtocol);
}

export async function createProtocol(p: Omit<Protocol, "id">): Promise<void> {
  const { error } = await supabaseAdmin
    .from("protocols")
    .insert(protocolToRow(p));
  if (error) throw error;
}

export async function updateProtocol(
  id: number,
  p: Omit<Protocol, "id">
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("protocols")
    .update(protocolToRow(p))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProtocol(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("protocols")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
