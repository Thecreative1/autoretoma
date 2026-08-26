"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { fieldErrors, leadSchema } from "@/lib/validation";
import { PUBLIC_LISTING_STATUSES } from "@/lib/constants";

export interface LeadState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

/** Hash do IP com sal, para limitar pedidos repetidos sem guardar o IP em claro. */
async function hashIp(): Promise<string> {
  // Sem um sal próprio o hash seria reversível — o espaço de endereços IPv4
  // percorre-se por força bruta em segundos. Preferimos falhar a gravar
  // pseudónimos que não protegem o IP de quem envia o pedido.
  const salt = process.env.LEAD_IP_SALT;
  if (!salt) {
    throw new Error("LEAD_IP_SALT não está definida.");
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "desconhecido";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

const MAX_LEADS_PER_HOUR = 5;

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const raw = {
    listing_id: String(formData.get("listing_id") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
    rgpd_consent: formData.get("rgpd_consent") === "on",
    website: String(formData.get("website") ?? ""),
  };

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  // O honeypot só é preenchido por bots.
  if (parsed.data.website) {
    return { ok: false, message: "Não foi possível enviar o pedido." };
  }

  const supabase = createAdminClient();

  let ipHash: string;
  try {
    ipHash = await hashIp();
  } catch (err) {
    console.error("submitLead:", err instanceof Error ? err.message : err);
    return { ok: false, message: "Não foi possível enviar o pedido. Tente novamente." };
  }

  // Limite por IP na última hora
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count: recentCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", oneHourAgo);

  if ((recentCount ?? 0) >= MAX_LEADS_PER_HOUR) {
    return {
      ok: false,
      message:
        "Enviou vários pedidos de contacto na última hora. Aguarde um pouco antes de enviar novo pedido.",
    };
  }

  // Pedido repetido para o mesmo anúncio nas últimas 24 horas
  const oneDayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const { count: duplicateCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", parsed.data.listing_id)
    .eq("email", parsed.data.email)
    .gte("created_at", oneDayAgo);

  if ((duplicateCount ?? 0) > 0) {
    return {
      ok: false,
      message:
        "Já enviou um pedido para este anúncio nas últimas 24 horas. O stand vai responder-lhe diretamente.",
    };
  }

  // O anúncio tem de estar visível ao público e pertencer a um stand aprovado
  const { data: listing } = await supabase
    .from("listings")
    .select("id, stand_id, status, stand:stands!inner(status)")
    .eq("id", parsed.data.listing_id)
    .maybeSingle();

  const standStatus = (listing as unknown as { stand?: { status?: string } } | null)?.stand?.status;
  if (
    !listing ||
    !PUBLIC_LISTING_STATUSES.includes(listing.status) ||
    standStatus !== "aprovado"
  ) {
    return { ok: false, message: "Este anúncio já não está disponível." };
  }

  const { error } = await supabase.from("leads").insert({
    listing_id: listing.id,
    stand_id: listing.stand_id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message: parsed.data.message,
    rgpd_consent: true,
    ip_hash: ipHash,
  });

  if (error) {
    console.error("submitLead:", error.message);
    return { ok: false, message: "Não foi possível enviar o pedido. Tente novamente." };
  }

  return {
    ok: true,
    message:
      "Pedido enviado. O stand recebeu os seus dados e entrará em contacto diretamente consigo.",
  };
}
