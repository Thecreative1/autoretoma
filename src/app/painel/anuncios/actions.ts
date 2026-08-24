"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOwnStand } from "@/lib/auth";
import {
  fieldErrors,
  issueSchema,
  listingStep1Schema,
  listingStep2Schema,
  listingStep5Schema,
} from "@/lib/validation";
import { buildListingSlug } from "@/lib/utils";
import { CONDITION_AREAS } from "@/lib/constants";
import type { ConditionStatus, ListingStatus } from "@/lib/types";

export interface ActionState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

/** Confirma que o anúncio pertence ao stand com sessão iniciada. */
async function assertOwnership(listingId: string) {
  const stand = await getOwnStand();
  if (!stand) throw new Error("Sem stand associado.");
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("id, stand_id, status")
    .eq("id", listingId)
    .maybeSingle();
  if (!data || data.stand_id !== stand.id) throw new Error("Anúncio não encontrado.");
  return { stand, supabase, listing: data as { id: string; status: ListingStatus } };
}

// ------------------------------------------------------------
// Passo 1 — Identificação da viatura (cria o rascunho na primeira gravação)
// ------------------------------------------------------------
export async function saveStep1(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const stand = await getOwnStand();
  if (!stand) return { ok: false, message: "A sua conta ainda não está associada a nenhum stand. Escreva para contacto@autoretoma.pt para resolvermos a situação." };

  const listingId = String(formData.get("listing_id") ?? "");
  const parsed = listingStep1Schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const supabase = await createClient();
  const payload = {
    brand_id: d.brand_id,
    model_id: d.model_id,
    version: d.version || null,
    year: d.year,
    month: d.month ?? null,
    mileage: d.mileage,
    fuel: d.fuel,
    gearbox: d.gearbox,
  };

  if (listingId) {
    await assertOwnership(listingId);
    const { error } = await supabase.from("listings").update(payload).eq("id", listingId);
    if (error) return { ok: false, message: error.message };
    revalidatePath(`/painel/anuncios/${listingId}`);
    redirect(`/painel/anuncios/${listingId}?passo=2`);
  }

  const { data: created, error } = await supabase
    .from("listings")
    .insert({ ...payload, stand_id: stand.id, status: "rascunho" })
    .select("id")
    .single();

  if (error || !created) {
    console.error("criar anúncio:", error?.message);
    return {
      ok: false,
      message: "Não foi possível criar o anúncio. Tente novamente dentro de momentos.",
    };
  }

  // Estado inicial de cada área: não verificado
  await supabase.from("listing_conditions").insert(
    CONDITION_AREAS.map((area) => ({
      listing_id: created.id,
      area: area.value,
      status: "nao_verificado" as ConditionStatus,
    }))
  );

  revalidatePath("/painel/anuncios");
  redirect(`/painel/anuncios/${created.id}?passo=2`);
}

// ------------------------------------------------------------
// Passo 2 — Características técnicas
// ------------------------------------------------------------
export async function saveStep2(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const listingId = String(formData.get("listing_id") ?? "");
  const { supabase } = await assertOwnership(listingId);

  const parsed = listingStep2Schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const { error } = await supabase
    .from("listings")
    .update({
      displacement_cc: d.displacement_cc ?? null,
      power_hp: d.power_hp ?? null,
      doors: d.doors ?? null,
      keys_count: d.keys_count ?? null,
      owners_count: d.owners_count ?? null,
      inspection_valid_until: d.inspection_valid_until || null,
      maintenance_history: d.maintenance_history || null,
    })
    .eq("id", listingId);

  if (error) {
    console.error("guardar fotografia:", error.message);
    return { ok: false, message: "Não foi possível guardar a fotografia. Tente novamente." };
  }

  revalidatePath(`/painel/anuncios/${listingId}`);
  redirect(`/painel/anuncios/${listingId}?passo=3`);
}

// ------------------------------------------------------------
// Passo 5 — Preço e localização
// ------------------------------------------------------------
export async function saveStep5(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const listingId = String(formData.get("listing_id") ?? "");
  const { supabase } = await assertOwnership(listingId);

  const parsed = listingStep5Schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const { data: settings } = await supabase
    .from("platform_settings")
    .select("max_price_eur")
    .eq("id", 1)
    .single();

  const maxPrice = settings?.max_price_eur ?? 5000;
  if (d.price > maxPrice) {
    return {
      ok: false,
      errors: {
        price: `O preço excede o limite atual da plataforma (${maxPrice.toLocaleString("pt-PT")} €).`,
      },
    };
  }

  const { error } = await supabase
    .from("listings")
    .update({
      price: d.price,
      district: d.district,
      municipality: d.municipality || null,
      description: d.description || null,
    })
    .eq("id", listingId);

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/painel/anuncios/${listingId}`);
  redirect(`/painel/anuncios/${listingId}?passo=6`);
}

// ------------------------------------------------------------
// Estado por área
// ------------------------------------------------------------
export async function saveConditions(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const listingId = String(formData.get("listing_id") ?? "");
  const { supabase } = await assertOwnership(listingId);

  for (const area of CONDITION_AREAS) {
    const value = String(formData.get(`area_${area.value}`) ?? "nao_verificado");
    const { error } = await supabase
      .from("listing_conditions")
      .upsert(
        { listing_id: listingId, area: area.value, status: value as ConditionStatus },
        { onConflict: "listing_id,area" }
      );
    if (error) return { ok: false, message: error.message };
  }

  revalidatePath(`/painel/anuncios/${listingId}`);
  return { ok: true, message: "Estado da viatura guardado." };
}

// ------------------------------------------------------------
// Problemas declarados
// ------------------------------------------------------------
export async function addIssue(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const listingId = String(formData.get("listing_id") ?? "");
  const { supabase } = await assertOwnership(listingId);

  const parsed = issueSchema.safeParse({
    area: String(formData.get("area") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    severity: String(formData.get("severity") ?? "media"),
    repair_estimate_eur: String(formData.get("repair_estimate_eur") ?? ""),
    prevents_driving: formData.get("prevents_driving") === "on",
    photo_url: String(formData.get("photo_url") ?? ""),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { count } = await supabase
    .from("listing_issues")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  const { error } = await supabase.from("listing_issues").insert({
    listing_id: listingId,
    area: parsed.data.area,
    title: parsed.data.title,
    description: parsed.data.description,
    severity: parsed.data.severity,
    repair_estimate_eur: parsed.data.repair_estimate_eur ?? null,
    prevents_driving: parsed.data.prevents_driving,
    photo_url: parsed.data.photo_url || null,
    sort_order: count ?? 0,
  });
  if (error) return { ok: false, message: error.message };

  // Declarar um problema numa área marca essa área como "problema declarado".
  await supabase
    .from("listing_conditions")
    .upsert(
      { listing_id: listingId, area: parsed.data.area, status: "problema_declarado" },
      { onConflict: "listing_id,area" }
    );

  revalidatePath(`/painel/anuncios/${listingId}`);
  return { ok: true, message: "Problema declarado adicionado." };
}

export async function deleteIssue(formData: FormData) {
  const listingId = String(formData.get("listing_id") ?? "");
  const issueId = String(formData.get("issue_id") ?? "");
  const { supabase } = await assertOwnership(listingId);
  await supabase.from("listing_issues").delete().eq("id", issueId).eq("listing_id", listingId);
  revalidatePath(`/painel/anuncios/${listingId}`);
}

// ------------------------------------------------------------
// Fotografias
// ------------------------------------------------------------
export async function addPhoto(formData: FormData): Promise<ActionState> {
  const listingId = String(formData.get("listing_id") ?? "");
  const url = String(formData.get("url") ?? "");
  const category = String(formData.get("category") ?? "outra");
  if (!url) {
    return { ok: false, message: "Não foi possível guardar a fotografia. Tente carregá-la outra vez." };
  }

  const { supabase } = await assertOwnership(listingId);
  const { count } = await supabase
    .from("listing_photos")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  const { error } = await supabase.from("listing_photos").insert({
    listing_id: listingId,
    url,
    category,
    is_defect: category === "defeito",
    sort_order: count ?? 0,
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath(`/painel/anuncios/${listingId}`);
  return { ok: true };
}

export async function deletePhoto(formData: FormData) {
  const listingId = String(formData.get("listing_id") ?? "");
  const photoId = String(formData.get("photo_id") ?? "");
  const { supabase } = await assertOwnership(listingId);
  await supabase.from("listing_photos").delete().eq("id", photoId).eq("listing_id", listingId);
  revalidatePath(`/painel/anuncios/${listingId}`);
}

// ------------------------------------------------------------
// Submeter para aprovação
// ------------------------------------------------------------
export async function submitForReview(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const listingId = String(formData.get("listing_id") ?? "");
  const { supabase, stand } = await assertOwnership(listingId);

  if (stand.status !== "aprovado") {
    return {
      ok: false,
      message: "O seu stand ainda não está aprovado. Só poderá submeter anúncios após a aprovação.",
    };
  }

  const [{ data: listing }, { data: photos }, { data: settings }] = await Promise.all([
    supabase
      .from("listings")
      .select("*, brand:brands(name), model:models(name)")
      .eq("id", listingId)
      .single(),
    supabase.from("listing_photos").select("category").eq("listing_id", listingId),
    supabase.from("platform_settings").select("*").eq("id", 1).single(),
  ]);

  if (!listing) return { ok: false, message: "Anúncio não encontrado." };

  const minPhotos = settings?.min_photos ?? 8;
  const maxPrice = settings?.max_price_eur ?? 5000;
  const problems: string[] = [];

  if ((photos?.length ?? 0) < minPhotos) {
    problems.push(`São necessárias pelo menos ${minPhotos} fotografias (tem ${photos?.length ?? 0}).`);
  }

  const required = [
    "frontal",
    "traseira",
    "lateral_esquerda",
    "lateral_direita",
    "interior",
    "conta_quilometros",
    "motor",
  ];
  const present = new Set((photos ?? []).map((p) => p.category));
  const missing = required.filter((r) => !present.has(r));
  if (missing.length > 0) {
    problems.push(`Faltam fotografias obrigatórias: ${missing.length} categoria(s) por preencher.`);
  }

  if (listing.price > maxPrice) {
    problems.push(`O preço excede o limite atual da plataforma (${maxPrice} €).`);
  }

  if (problems.length > 0) {
    return { ok: false, message: problems.join(" ") };
  }

  // Slug SEO estável, gerado na submissão
  const brandName = (listing as unknown as { brand: { name: string } }).brand.name;
  const modelName = (listing as unknown as { model: { name: string } }).model.name;
  const base = buildListingSlug({
    brand: brandName,
    model: modelName,
    year: listing.year,
    municipality: listing.municipality,
    district: listing.district,
    price: listing.price,
  });

  let slug = listing.slug ?? base;
  if (!listing.slug) {
    for (let i = 2; i < 60; i++) {
      const { data: taken } = await supabase
        .from("listings")
        .select("id")
        .eq("slug", slug)
        .neq("id", listingId)
        .maybeSingle();
      if (!taken) break;
      slug = `${base}-${i}`;
    }
  }

  const { error } = await supabase
    .from("listings")
    .update({ status: "em_analise", slug })
    .eq("id", listingId);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/painel/anuncios");
  redirect("/painel/anuncios?submetido=1");
}

// ------------------------------------------------------------
// Mudanças de estado (reservado / vendido / arquivado / voltar a rascunho)
// ------------------------------------------------------------
export async function changeListingStatus(formData: FormData) {
  const listingId = String(formData.get("listing_id") ?? "");
  const status = String(formData.get("status") ?? "") as ListingStatus;
  const allowed: ListingStatus[] = ["publicado", "reservado", "vendido", "arquivado", "rascunho"];
  if (!allowed.includes(status)) return;

  const { supabase } = await assertOwnership(listingId);
  const { error } = await supabase.from("listings").update({ status }).eq("id", listingId);
  if (error) console.error("changeListingStatus:", error.message);

  revalidatePath("/painel/anuncios");
  revalidatePath("/carros");
}

// ------------------------------------------------------------
// Duplicar anúncio
// ------------------------------------------------------------
export async function duplicateListing(formData: FormData) {
  const listingId = String(formData.get("listing_id") ?? "");
  const { supabase, stand } = await assertOwnership(listingId);

  const { data: original } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();
  if (!original) return;

  const {
    id: _id,
    slug: _slug,
    status: _status,
    views_count: _views,
    featured: _featured,
    admin_feedback: _feedback,
    submitted_at: _submitted,
    published_at: _published,
    sold_at: _sold,
    created_at: _created,
    updated_at: _updated,
    ...rest
  } = original;

  const { data: copy, error } = await supabase
    .from("listings")
    .insert({ ...rest, stand_id: stand.id, status: "rascunho", slug: null })
    .select("id")
    .single();

  if (error || !copy) {
    console.error("duplicateListing:", error?.message);
    return;
  }

  // Copiar estado por área, problemas e fotografias
  const [{ data: conditions }, { data: issues }, { data: photos }] = await Promise.all([
    supabase.from("listing_conditions").select("area, status").eq("listing_id", listingId),
    supabase
      .from("listing_issues")
      .select("area, title, description, severity, photo_url, repair_estimate_eur, prevents_driving, sort_order")
      .eq("listing_id", listingId),
    supabase
      .from("listing_photos")
      .select("url, category, is_defect, sort_order")
      .eq("listing_id", listingId),
  ]);

  if (conditions?.length) {
    await supabase
      .from("listing_conditions")
      .insert(conditions.map((c) => ({ ...c, listing_id: copy.id })));
  }
  if (issues?.length) {
    await supabase.from("listing_issues").insert(issues.map((i) => ({ ...i, listing_id: copy.id })));
  }
  if (photos?.length) {
    await supabase.from("listing_photos").insert(photos.map((p) => ({ ...p, listing_id: copy.id })));
  }

  revalidatePath("/painel/anuncios");
  redirect(`/painel/anuncios/${copy.id}`);
}

// ------------------------------------------------------------
// Eliminar rascunho
// ------------------------------------------------------------
export async function deleteListing(formData: FormData) {
  const listingId = String(formData.get("listing_id") ?? "");
  const { supabase, listing } = await assertOwnership(listingId);
  if (listing.status !== "rascunho") return;
  await supabase.from("listings").delete().eq("id", listingId);
  revalidatePath("/painel/anuncios");
  redirect("/painel/anuncios");
}
