import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { PUBLIC_LISTING_STATUSES, SITE_URL } from "@/lib/constants";
import { slugify } from "@/lib/utils";

// Conteúdo público: gerado no servidor sem sessão, revalidado de hora a hora.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/carros`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/como-funciona`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/para-stands`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/registar`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contactos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/termos-e-condicoes`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/politica-de-privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/politica-de-cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/vendedores-profissionais`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/resolucao-de-litigios`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/livro-de-reclamacoes`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const supabase = createAdminClient();

    const [{ data: listings }, { data: settings }] = await Promise.all([
      supabase
        .from("listings")
        .select("slug, updated_at, district, fuel, brand:brands(slug), stand:stands!inner(status)")
        .in("status", PUBLIC_LISTING_STATUSES)
        .eq("stand.status", "aprovado")
        .not("slug", "is", null)
        .order("published_at", { ascending: false })
        .limit(5000),
      supabase.from("platform_settings").select("facet_min_listings").eq("id", 1).maybeSingle(),
    ]);

    const rows = (listings ?? []) as unknown as {
      slug: string;
      updated_at: string;
      district: string;
      fuel: string;
      brand: { slug: string } | null;
    }[];

    const listingPages: MetadataRoute.Sitemap = rows.map((l) => ({
      url: `${SITE_URL}/carros/${l.slug}`,
      lastModified: new Date(l.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Facetas com anúncios suficientes para justificarem uma página própria
    const min = settings?.facet_min_listings ?? 3;
    const count = <T>(items: T[], key: (item: T) => string | null) => {
      const map = new Map<string, number>();
      for (const item of items) {
        const k = key(item);
        if (k) map.set(k, (map.get(k) ?? 0) + 1);
      }
      return [...map.entries()].filter(([, n]) => n >= min).map(([k]) => k);
    };

    const facetPages: MetadataRoute.Sitemap = [
      ...count(rows, (r) => r.brand?.slug ?? null).map((slug) => ({
        url: `${SITE_URL}/carros/marca/${slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
      ...count(rows, (r) => r.district).map((district) => ({
        url: `${SITE_URL}/carros/distrito/${slugify(district)}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
      ...count(rows, (r) => r.fuel).map((fuel) => ({
        url: `${SITE_URL}/carros/combustivel/${fuel}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.6,
      })),
    ];

    return [...staticPages, ...facetPages, ...listingPages];
  } catch (error) {
    // Sem base de dados disponível (por exemplo, durante o build inicial),
    // publica-se pelo menos as páginas estáticas.
    console.error("sitemap:", error);
    return staticPages;
  }
}
