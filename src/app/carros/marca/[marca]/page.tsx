import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FacetPage } from "@/components/FacetPage";
import { createClient } from "@/lib/supabase/server";
import { getSettings, searchListings } from "@/lib/queries";
import { SITE_URL } from "@/lib/constants";

type Params = Promise<{ marca: string }>;

async function getBrand(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("name, slug").eq("slug", slug).maybeSingle();
  return data as { name: string; slug: string } | null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { marca } = await params;
  const brand = await getBrand(marca);
  if (!brand) return { title: "Marca não encontrada" };

  return {
    title: `${brand.name} usados baratos — retomas de stands`,
    description: `Carros ${brand.name} usados de baixo valor e retomas de stands portugueses, com o estado e os defeitos declarados antes do contacto.`,
    alternates: { canonical: `${SITE_URL}/carros/marca/${brand.slug}` },
  };
}

export default async function BrandFacetPage({ params }: { params: Params }) {
  const { marca } = await params;
  const brand = await getBrand(marca);
  if (!brand) notFound();

  const [settings, result] = await Promise.all([
    getSettings(),
    searchListings({ marca, ordenar: "recentes" }),
  ]);

  // Sem anúncios suficientes, a página não é criada (evita conteúdo fino).
  if (result.count < settings.facet_min_listings) notFound();

  return (
    <FacetPage
      title={`${brand.name} usados baratos`}
      intro={`${result.count} ${
        result.count === 1 ? "carro" : "carros"
      } ${brand.name} de baixo valor publicados por stands portugueses. Cada anúncio mostra o estado por área e os problemas declarados pelo vendedor.`}
      listings={result.items}
      searchHref={`/carros?marca=${brand.slug}`}
      breadcrumb={brand.name}
    />
  );
}
