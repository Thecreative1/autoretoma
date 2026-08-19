"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOwnStand } from "@/lib/auth";
import { fieldErrors, standUpdateSchema } from "@/lib/validation";

export interface StandState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function updateStand(_prev: StandState, formData: FormData): Promise<StandState> {
  const stand = await getOwnStand();
  if (!stand) return { ok: false, message: "Sem stand associado." };

  const parsed = standUpdateSchema.safeParse({
    commercial_name: String(formData.get("commercial_name") ?? ""),
    company_name: String(formData.get("company_name") ?? ""),
    contact_name: String(formData.get("contact_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    address: String(formData.get("address") ?? ""),
    district: String(formData.get("district") ?? ""),
    website: String(formData.get("website") ?? ""),
    activity_id: String(formData.get("activity_id") ?? ""),
  });

  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("stands")
    .update({
      commercial_name: d.commercial_name,
      company_name: d.company_name,
      contact_name: d.contact_name,
      phone: d.phone,
      whatsapp: d.whatsapp || null,
      address: d.address,
      district: d.district,
      website: d.website || null,
      activity_id: d.activity_id || null,
    })
    .eq("id", stand.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/painel/stand");
  revalidatePath("/painel", "layout");
  return { ok: true, message: "Dados do stand atualizados." };
}

export async function updateStandLogo(formData: FormData) {
  const stand = await getOwnStand();
  if (!stand) return;
  const url = String(formData.get("logo_url") ?? "");
  if (!url) return;

  const supabase = await createClient();
  const { error } = await supabase.from("stands").update({ logo_url: url }).eq("id", stand.id);
  if (error) console.error("updateStandLogo:", error.message);

  revalidatePath("/painel/stand");
}
