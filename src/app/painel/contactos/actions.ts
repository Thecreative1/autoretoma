"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOwnStand } from "@/lib/auth";
import type { LeadStatus } from "@/lib/types";

export async function updateLeadStatus(formData: FormData) {
  const leadId = String(formData.get("lead_id") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  if (!["novo", "contactado", "fechado"].includes(status)) return;

  const stand = await getOwnStand();
  if (!stand) return;

  const supabase = await createClient();
  // O RLS já restringe aos leads do próprio stand; o filtro torna a intenção explícita.
  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId)
    .eq("stand_id", stand.id);

  if (error) console.error("updateLeadStatus:", error.message);
  revalidatePath("/painel/contactos");
}
