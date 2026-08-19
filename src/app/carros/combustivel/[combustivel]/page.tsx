import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FacetPage } from "@/components/FacetPage";
import { getSettings, searchListings } from "@/lib/queries";
import { FUEL_LABELS, SITE_URL } from "@/lib/constants";
import type { FuelType } from "@/lib/types";

type Params = Promise<{ combustivel: string }>;

function resolveFuel(slug: string): FuelType | null {
  return slug in FUEL_LABELS ? (slug as FuelType) : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { combustivel } = await params;
  const fuel = resolveFuel(combustivel);
  if (!fuel) return { title: "Combustível não encontrado" };

  const label = FUEL_LABELS[fuel];
  return {
    title: `Carros a ${label.toLowerCase()} baratos — retomas de stands`,
    description: `Retomas e carros usados de baixo valor a ${label.toLowerCase()}, vendidos por stands portugueses com os defeitos conhecidos declarados.`,
    alternates: { canonical: `${SITE_URL}/carros/combustivel/${combustivel}` },
  };
}

export default async function FuelFacetPage({ params }: { params: Params }) {
  const { combustivel } = await params;
  const fuel = resolveFuel(combustivel);
  if (!fuel) notFound();

  const [settings, result] = await Promise.all([
    getSettings(),
    searchListings({ combustivel: fuel, ordenar: "recentes" }),
  ]);

  if (result.count < settings.facet_min_listings) notFound();

  const label = FUEL_LABELS[fuel];

  return (
    <FacetPage
      title={`Carros a ${label.toLowerCase()} baratos`}
      intro={`${result.count} ${
        result.count === 1 ? "carro" : "carros"
      } a ${label.toLowerCase()} de baixo valor, publicados por stands portugueses com o estado da viatura declarado.`}
      listings={result.items}
      searchHref={`/carros?combustivel=${fuel}`}
      breadcrumb={label}
    />
  );
}
