"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile, getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { ListingStatus, StandStatus } from "@/lib/types";

export interface AdminState {
  ok: boolean;
  message?: string;
}

/** Garante que quem executa a ação é administrador. */
async function requireAdminUser() {
  const user = await getSessionUser();
  const profile = await getProfile();
  if (!user || profile?.role !== "admin") throw new Error("Sem permissão.");
  return user;
}

/** Regista a ação no log de auditoria. */
async function audit(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  details?: Record<string, unknown>
) {
  const admin = createAdminClient();
  const { error } = await admin.from("admin_audit_log").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: details ?? null,
  });
  if (error) console.error("audit:", error.message);
}

// ------------------------------------------------------------
// Stands
// ------------------------------------------------------------
export async function setStandStatus(formData: FormData) {
  const user = await requireAdminUser();
  const standId = String(formData.get("stand_id") ?? "");
  const status = String(formData.get("status") ?? "") as StandStatus;
  const notes = String(formData.get("admin_notes") ?? "").trim();

  if (!["pendente", "aprovado", "suspenso", "rejeitado"].includes(status)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("stands")
    .update({ status, admin_notes: notes || null })
    .eq("id", standId);

  if (error) {
    console.error("setStandStatus:", error.message);
    return;
  }

  // Suspender ou rejeitar um stand retira os anúncios da circulação pública.
  if (status === "suspenso" || status === "rejeitado") {
    await supabase
      .from("listings")
      .update({ status: "arquivado" })
      .eq("stand_id", standId)
      .in("status", ["publicado", "reservado", "em_analise"]);
  }

  await audit(user.id, `stand_${status}`, "stand", standId, { notes: notes || null });

  revalidatePath("/admin/stands");
  revalidatePath("/admin");
  revalidatePath("/carros");
}

/**
 * Converte URLs públicos em caminhos do bucket e remove os ficheiros.
 * Devolve quantos ficheiros ficaram por remover.
 */
async function removeStoredFiles(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  urls: (string | null)[]
): Promise<number> {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const paths = urls
    .map((url) => url?.split(marker)[1])
    .filter((path): path is string => Boolean(path))
    .map((path) => decodeURIComponent(path));

  let failed = 0;
  // A API de remoção tem limite por pedido, daí os lotes.
  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100);
    const { error } = await admin.storage.from(bucket).remove(batch);
    if (error) {
      console.error(`removeStoredFiles (${bucket}):`, error.message);
      failed += batch.length;
    }
  }
  return failed;
}

/**
 * Remove um stand por inteiro: conta de acesso, anúncios, fotografias, estado
 * declarado, defeitos e pedidos de contacto. Não tem retrocesso — ao contrário de
 * suspender ou rejeitar, que preservam os dados. Exige o stand suspenso.
 */
export async function deleteStand(formData: FormData): Promise<AdminState> {
  const user = await requireAdminUser();
  const standId = String(formData.get("stand_id") ?? "");

  const admin = createAdminClient();
  const { data: stand } = await admin
    .from("stands")
    .select("id, owner_id, commercial_name, company_name, nif, email, status, logo_url")
    .eq("id", standId)
    .maybeSingle();

  if (!stand) return { ok: false, message: "Stand não encontrado. Talvez já tenha sido removido." };

  // Suspender primeiro é o que separa a remoção de um clique enganado: obriga a uma
  // decisão anterior, já registada, e tira os anúncios de circulação antes de apagar.
  if (stand.status !== "suspenso") {
    return {
      ok: false,
      message: "Só se remove um stand suspenso. Suspenda-o primeiro e volte a tentar.",
    };
  }

  const [{ data: listings }, { count: leadCount }] = await Promise.all([
    admin.from("listings").select("id").eq("stand_id", standId),
    admin.from("leads").select("id", { count: "exact", head: true }).eq("stand_id", standId),
  ]);
  const listingIds = (listings ?? []).map((l) => l.id);

  const { data: photos } = listingIds.length
    ? await admin.from("listing_photos").select("url").in("listing_id", listingIds)
    : { data: [] as { url: string }[] };

  // A base de dados primeiro. Se falhar, os ficheiros continuam a corresponder ao
  // que lá está; pela ordem inversa ficariam anúncios a apontar para imagens mortas.
  const { error: userError } = await admin.auth.admin.deleteUser(stand.owner_id);
  if (userError) {
    // A conta de acesso pode já não existir; o stand tem de sair na mesma.
    const { error: standError } = await admin.from("stands").delete().eq("id", standId);
    if (standError) {
      console.error("deleteStand:", userError.message, standError.message);
      return {
        ok: false,
        message: "Não foi possível remover o stand. Não foi apagado nada.",
      };
    }
  }

  // Só depois de a remoção passar. O que o registo guarda já está lido acima, por
  // isso não se perde nada por esperar — e o log não fica com remoções que falharam.
  await audit(user.id, "stand_removido", "stand", standId, {
    commercial_name: stand.commercial_name,
    company_name: stand.company_name,
    nif: stand.nif,
    email: stand.email,
    status: stand.status,
    anuncios: listingIds.length,
    contactos: leadCount ?? 0,
    fotografias: photos?.length ?? 0,
  });

  const orphans =
    (await removeStoredFiles(admin, "listings", (photos ?? []).map((p) => p.url))) +
    (await removeStoredFiles(admin, "logos", [stand.logo_url]));

  revalidatePath("/admin/stands");
  revalidatePath("/admin");
  revalidatePath("/admin/registo");
  revalidatePath("/carros");

  return {
    ok: true,
    message:
      `Stand "${stand.commercial_name}" removido, com ${listingIds.length} anúncio(s) e ` +
      `${leadCount ?? 0} pedido(s) de contacto.` +
      (orphans > 0 ? ` ${orphans} ficheiro(s) ficaram no armazenamento e precisam de limpeza manual.` : ""),
  };
}

// ------------------------------------------------------------
// Anúncios: moderação
// ------------------------------------------------------------
export async function moderateListing(formData: FormData) {
  const user = await requireAdminUser();
  const listingId = String(formData.get("listing_id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const feedback = String(formData.get("admin_feedback") ?? "").trim();
  const filter = String(formData.get("estado") ?? "em_analise");

  const back = (error?: string) =>
    `/admin/anuncios?estado=${encodeURIComponent(filter)}${error ? `&erro=${error}` : ""}`;

  const map: Record<string, ListingStatus> = {
    aprovar: "publicado",
    alteracoes: "alteracoes_necessarias",
    rejeitar: "rejeitado",
    arquivar: "arquivado",
  };
  const status = map[decision];
  if (!status) redirect(back("decisao"));

  // Pedir alterações ou rejeitar exige um motivo escrito, que é enviado ao stand.
  if ((status === "alteracoes_necessarias" || status === "rejeitado") && !feedback) {
    redirect(back("motivo"));
  }

  const supabase = await createClient();
  const update: Record<string, unknown> = { status, admin_feedback: feedback || null };
  if (status === "publicado") update.published_at = new Date().toISOString();

  const { error } = await supabase.from("listings").update(update).eq("id", listingId);
  if (error) {
    console.error("moderateListing:", error.message);
    redirect(back("gravacao"));
  }

  await audit(user.id, `anuncio_${decision}`, "listing", listingId, {
    feedback: feedback || null,
  });

  revalidatePath("/admin/anuncios");
  revalidatePath("/admin");
  revalidatePath("/carros");
  redirect(back());
}

export async function toggleFeatured(formData: FormData) {
  const user = await requireAdminUser();
  const listingId = String(formData.get("listing_id") ?? "");
  const featured = String(formData.get("featured") ?? "") === "1";

  const supabase = await createClient();
  const { error } = await supabase.from("listings").update({ featured }).eq("id", listingId);
  if (error) {
    console.error("toggleFeatured:", error.message);
    return;
  }

  await audit(user.id, featured ? "anuncio_destacado" : "anuncio_sem_destaque", "listing", listingId);

  revalidatePath("/admin/anuncios");
  revalidatePath("/carros");
  revalidatePath("/");
}

// ------------------------------------------------------------
// Definições da plataforma
// ------------------------------------------------------------
export async function updateSettings(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await requireAdminUser();

  const maxPrice = Number.parseInt(String(formData.get("max_price_eur") ?? ""), 10);
  const minPhotos = Number.parseInt(String(formData.get("min_photos") ?? ""), 10);
  const facetMin = Number.parseInt(String(formData.get("facet_min_listings") ?? ""), 10);

  if (!Number.isFinite(maxPrice) || maxPrice < 1) {
    return { ok: false, message: "Indique um limite de preço válido." };
  }
  if (!Number.isFinite(minPhotos) || minPhotos < 1 || minPhotos > 30) {
    return { ok: false, message: "O mínimo de fotografias deve estar entre 1 e 30." };
  }
  if (!Number.isFinite(facetMin) || facetMin < 1) {
    return {
      ok: false,
      message: "Indique um mínimo válido para as páginas por marca, distrito e combustível.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("platform_settings")
    .update({
      max_price_eur: maxPrice,
      min_photos: minPhotos,
      facet_min_listings: facetMin,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", 1);

  if (error) {
    console.error("guardar definições:", error.message);
    return { ok: false, message: "Não foi possível guardar as definições. Tente novamente." };
  }

  await audit(user.id, "definicoes_atualizadas", "platform_settings", "1", {
    max_price_eur: maxPrice,
    min_photos: minPhotos,
    facet_min_listings: facetMin,
  });

  revalidatePath("/admin/definicoes");
  revalidatePath("/carros");
  revalidatePath("/");
  return { ok: true, message: "Definições atualizadas." };
}

// ------------------------------------------------------------
// Marcas e modelos
// ------------------------------------------------------------
export async function createBrand(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await requireAdminUser();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { ok: false, message: "Indique o nome da marca." };

  const supabase = await createClient();
  const { error } = await supabase.from("brands").insert({ name, slug: slugify(name) });
  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "Essa marca já existe."
          : "Não foi possível guardar a marca. Tente novamente.",
    };
  }

  await audit(user.id, "marca_criada", "brand", null, { name });
  revalidatePath("/admin/marcas");
  return { ok: true, message: `Marca "${name}" adicionada.` };
}

export async function createModel(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await requireAdminUser();
  const brandId = String(formData.get("brand_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!brandId) return { ok: false, message: "Escolha a marca." };
  if (name.length < 1) return { ok: false, message: "Indique o nome do modelo." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("models")
    .insert({ brand_id: brandId, name, slug: slugify(name) });

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "Esse modelo já existe nesta marca."
          : "Não foi possível guardar o modelo. Tente novamente.",
    };
  }

  await audit(user.id, "modelo_criado", "model", null, { brand_id: brandId, name });
  revalidatePath("/admin/marcas");
  return { ok: true, message: `Modelo "${name}" adicionado.` };
}

export async function deleteModel(formData: FormData) {
  const user = await requireAdminUser();
  const modelId = String(formData.get("model_id") ?? "");

  const supabase = await createClient();
  // Modelos com anúncios associados não podem ser removidos.
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("model_id", modelId);
  if ((count ?? 0) > 0) return;

  const { error } = await supabase.from("models").delete().eq("id", modelId);
  if (error) {
    console.error("deleteModel:", error.message);
    return;
  }

  await audit(user.id, "modelo_removido", "model", modelId);
  revalidatePath("/admin/marcas");
}

// ------------------------------------------------------------
// Leads
// ------------------------------------------------------------
export async function setLeadStatusAdmin(formData: FormData) {
  await requireAdminUser();
  const leadId = String(formData.get("lead_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["novo", "contactado", "fechado"].includes(status)) return;

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (error) console.error("setLeadStatusAdmin:", error.message);

  revalidatePath("/admin/leads");
}
