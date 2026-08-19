import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE, PUBLIC_LISTING_STATUSES, type SortOption } from "@/lib/constants";
import type { Brand, ListingCard, ListingWithRelations, Model, PlatformSettings } from "@/lib/types";

export const CARD_SELECT = `
  id, slug, version, year, price, mileage, fuel, gearbox, district, municipality,
  status, featured, inspection_valid_until, published_at,
  brand:brands(name, slug),
  model:models(name, slug),
  stand:stands!inner(commercial_name, slug, is_demo, status),
  photos:listing_photos(url, is_defect, sort_order, category),
  issues:listing_issues(id)
`;

export interface SearchFilters {
  q?: string;
  marca?: string;
  modelo?: string;
  preco_min?: number;
  preco_max?: number;
  ano_min?: number;
  ano_max?: number;
  km_max?: number;
  combustivel?: string;
  caixa?: string;
  distrito?: string;
  inspecao?: boolean;
  estado?: string; // disponivel | reservado | vendido
  sem_graves?: boolean;
  ordenar?: SortOption;
  pagina?: number;
}

export interface SearchResult {
  items: ListingCard[];
  count: number;
  page: number;
  pageCount: number;
}

/** Pesquisa pública de anúncios com filtros, ordenação e paginação. */
export async function searchListings(filters: SearchFilters): Promise<SearchResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.pagina ?? 1);

  let query = supabase
    .from("listings")
    .select(CARD_SELECT, { count: "exact" })
    .in("status", PUBLIC_LISTING_STATUSES)
    .eq("stand.status", "aprovado");

  // Pesquisa por texto: marca/modelo por nome + versão/descrição
  if (filters.q && filters.q.trim().length > 0) {
    const q = filters.q.trim().replace(/[%,()]/g, " ").slice(0, 60);
    const [{ data: brandHits }, { data: modelHits }] = await Promise.all([
      supabase.from("brands").select("id").ilike("name", `%${q}%`).limit(20),
      supabase.from("models").select("id").ilike("name", `%${q}%`).limit(40),
    ]);
    const ors: string[] = [`version.ilike.%${q}%`, `description.ilike.%${q}%`];
    if (brandHits?.length) ors.push(`brand_id.in.(${brandHits.map((b) => b.id).join(",")})`);
    if (modelHits?.length) ors.push(`model_id.in.(${modelHits.map((m) => m.id).join(",")})`);
    query = query.or(ors.join(","));
  }

  if (filters.marca) {
    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", filters.marca)
      .maybeSingle();
    query = query.eq("brand_id", brand?.id ?? "00000000-0000-0000-0000-000000000000");
    if (filters.modelo && brand) {
      const { data: model } = await supabase
        .from("models")
        .select("id")
        .eq("brand_id", brand.id)
        .eq("slug", filters.modelo)
        .maybeSingle();
      if (model) query = query.eq("model_id", model.id);
    }
  }

  if (filters.preco_min) query = query.gte("price", filters.preco_min);
  if (filters.preco_max) query = query.lte("price", filters.preco_max);
  if (filters.ano_min) query = query.gte("year", filters.ano_min);
  if (filters.ano_max) query = query.lte("year", filters.ano_max);
  if (filters.km_max) query = query.lte("mileage", filters.km_max);
  if (filters.combustivel) query = query.eq("fuel", filters.combustivel);
  if (filters.caixa) query = query.eq("gearbox", filters.caixa);
  if (filters.distrito) query = query.eq("district", filters.distrito);
  if (filters.inspecao) {
    query = query.gte("inspection_valid_until", new Date().toISOString().slice(0, 10));
  }

  if (filters.estado === "disponivel") query = query.eq("status", "publicado");
  else if (filters.estado === "reservado") query = query.eq("status", "reservado");
  else if (filters.estado === "vendido") query = query.eq("status", "vendido");

  // Apenas carros sem problemas mecânicos graves:
  // exclui anúncios com problemas de gravidade alta, que impeçam a circulação,
  // ou com "problema declarado" em motor, embraiagem/caixa ou travões.
  if (filters.sem_graves) {
    const [{ data: severe }, { data: mechBad }] = await Promise.all([
      supabase
        .from("listing_issues")
        .select("listing_id")
        .or("severity.eq.alta,prevents_driving.eq.true"),
      supabase
        .from("listing_conditions")
        .select("listing_id")
        .eq("status", "problema_declarado")
        .in("area", ["motor_mecanica", "embraiagem_caixa", "travoes"]),
    ]);
    const excluded = [
      ...new Set([
        ...(severe ?? []).map((r) => r.listing_id),
        ...(mechBad ?? []).map((r) => r.listing_id),
      ]),
    ];
    if (excluded.length > 0) {
      query = query.not("id", "in", `(${excluded.join(",")})`);
    }
  }

  // Destaques primeiro, depois a ordenação escolhida
  query = query.order("featured", { ascending: false });
  switch (filters.ordenar) {
    case "preco_asc":
      query = query.order("price", { ascending: true });
      break;
    case "preco_desc":
      query = query.order("price", { ascending: false });
      break;
    case "km_asc":
      query = query.order("mileage", { ascending: true });
      break;
    case "ano_desc":
      query = query.order("year", { ascending: false });
      break;
    default:
      query = query.order("published_at", { ascending: false, nullsFirst: false });
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);

  if (error) {
    console.error("searchListings:", error.message);
    return { items: [], count: 0, page: 1, pageCount: 1 };
  }

  return {
    items: (data ?? []) as unknown as ListingCard[],
    count: count ?? 0,
    page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
  };
}

/** Anúncios recentes para a homepage. */
export async function getRecentListings(limit = 8): Promise<ListingCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(CARD_SELECT)
    .in("status", PUBLIC_LISTING_STATUSES)
    .eq("stand.status", "aprovado")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) {
    console.error("getRecentListings:", error.message);
    return [];
  }
  return (data ?? []) as unknown as ListingCard[];
}

/** Anúncio completo por slug (página pública). */
export async function getListingBySlug(slug: string): Promise<ListingWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      `*,
       brand:brands(*),
       model:models(*),
       stand:stands!inner(id, slug, commercial_name, district, phone, whatsapp, email, logo_url, address, is_demo, status),
       photos:listing_photos(*),
       conditions:listing_conditions(*),
       issues:listing_issues(*)`
    )
    .eq("slug", slug)
    .in("status", PUBLIC_LISTING_STATUSES)
    .eq("stand.status", "aprovado")
    .maybeSingle();

  if (error) {
    console.error("getListingBySlug:", error.message);
    return null;
  }
  if (!data) return null;
  const listing = data as unknown as ListingWithRelations;
  listing.photos.sort((a, b) => a.sort_order - b.sort_order);
  listing.issues.sort((a, b) => a.sort_order - b.sort_order);
  return listing;
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").order("name");
  return (data ?? []) as Brand[];
}

export async function getModels(brandId?: string): Promise<Model[]> {
  const supabase = await createClient();
  let query = supabase.from("models").select("*").order("name");
  if (brandId) query = query.eq("brand_id", brandId);
  const { data } = await query;
  return (data ?? []) as Model[];
}

export async function getSettings(): Promise<PlatformSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("platform_settings").select("*").eq("id", 1).maybeSingle();
  return (
    (data as PlatformSettings) ?? {
      id: 1,
      max_price_eur: 5000,
      min_photos: 8,
      facet_min_listings: 3,
      updated_at: new Date().toISOString(),
      updated_by: null,
    }
  );
}

/** Contagens por faceta (marca/distrito/combustível) para SEO. */
export async function getFacetCounts(): Promise<{
  brands: { slug: string; name: string; count: number }[];
  districts: { name: string; count: number }[];
  fuels: { fuel: string; count: number }[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("district, fuel, brand:brands(name, slug), stand:stands!inner(status)")
    .in("status", PUBLIC_LISTING_STATUSES)
    .eq("stand.status", "aprovado")
    .limit(2000);

  const brandMap = new Map<string, { slug: string; name: string; count: number }>();
  const districtMap = new Map<string, number>();
  const fuelMap = new Map<string, number>();

  for (const row of (data ?? []) as unknown as {
    district: string;
    fuel: string;
    brand: { name: string; slug: string };
  }[]) {
    if (row.brand) {
      const cur = brandMap.get(row.brand.slug) ?? { ...row.brand, count: 0 };
      cur.count += 1;
      brandMap.set(row.brand.slug, cur);
    }
    districtMap.set(row.district, (districtMap.get(row.district) ?? 0) + 1);
    fuelMap.set(row.fuel, (fuelMap.get(row.fuel) ?? 0) + 1);
  }

  return {
    brands: [...brandMap.values()].sort((a, b) => b.count - a.count),
    districts: [...districtMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    fuels: [...fuelMap.entries()]
      .map(([fuel, count]) => ({ fuel, count }))
      .sort((a, b) => b.count - a.count),
  };
}
