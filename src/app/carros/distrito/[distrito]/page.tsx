import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FacetPage } from "@/components/FacetPage";
import { getSettings, searchListings } from "@/lib/queries";
import { DISTRICTS, SITE_URL } from "@/lib/constants";
import { slugify } from "@/lib/utils";

type Params = Promise<{ distrito: string }>;

function resolveDistrict(slug: string): string | null {
  return DISTRICTS.find((d) => slugify(d) === slug) ?? null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { distrito } = await params;
  const name = resolveDistrict(distrito);
  if (!name) return { title: "Distrito não encontrado" };

  return {
    title: `Carros baratos em ${name} — retomas de stands`,
    description: `Retomas e carros usados de baixo valor no distrito de ${name}, vendidos por stands com os defeitos conhecidos declarados.`,
    alternates: { canonical: `${SITE_URL}/carros/distrito/${distrito}` },
  };
}

export default async function DistrictFacetPage({ params }: { params: Params }) {
  const { distrito } = await params;
  const name = resolveDistrict(distrito);
  if (!name) notFound();

  const [settings, result] = await Promise.all([
    getSettings(),
    searchListings({ distrito: name, ordenar: "recentes" }),
  ]);

  if (result.count < settings.facet_min_listings) notFound();

  return (
    <FacetPage
      title={`Carros baratos em ${name}`}
      intro={`${result.count} ${
        result.count === 1 ? "carro" : "carros"
      } de baixo valor no distrito de ${name}, publicados por stands com o estado da viatura declarado antes do contacto.`}
      listings={result.items}
      searchHref={`/carros?distrito=${encodeURIComponent(name)}`}
      breadcrumb={name}
    />
  );
}
