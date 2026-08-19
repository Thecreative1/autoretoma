import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters } from "@/components/search/SearchFilters";
import { Pagination } from "@/components/search/Pagination";
import { getBrands, getFacetCounts, getModels, getSettings, searchListings } from "@/lib/queries";
import { firstParam, slugify, toInt } from "@/lib/utils";
import { FUEL_LABELS, SITE_URL, type SortOption } from "@/lib/constants";
import type { FuelType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ver carros — retomas e viaturas de baixo valor",
  description:
    "Pesquisa retomas e carros usados de baixo valor vendidos por stands portugueses, com o estado e os defeitos declarados antes do contacto.",
  alternates: { canonical: `${SITE_URL}/carros` },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CarsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const plain: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(sp)) plain[key] = firstParam(value);

  const [brands, models, settings, facets] = await Promise.all([
    getBrands(),
    getModels(),
    getSettings(),
    getFacetCounts(),
  ]);

  // Ligações internas apenas para facetas com anúncios suficientes.
  const min = settings.facet_min_listings;
  const topBrands = facets.brands.filter((b) => b.count >= min).slice(0, 12);
  const topDistricts = facets.districts.filter((d) => d.count >= min).slice(0, 12);
  const topFuels = facets.fuels.filter((f) => f.count >= min);

  const result = await searchListings({
    q: plain.q,
    marca: plain.marca,
    modelo: plain.modelo,
    preco_min: toInt(plain.preco_min),
    preco_max: toInt(plain.preco_max),
    ano_min: toInt(plain.ano_min),
    ano_max: toInt(plain.ano_max),
    km_max: toInt(plain.km_max),
    combustivel: plain.combustivel,
    caixa: plain.caixa,
    distrito: plain.distrito,
    inspecao: plain.inspecao === "1",
    estado: plain.estado,
    sem_graves: plain.sem_graves === "1",
    ordenar: (plain.ordenar as SortOption) ?? "recentes",
    pagina: toInt(plain.pagina) ?? 1,
  });

  return (
    <div className="container-site py-8 lg:py-12">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ver carros
        </h1>
        <p className="mt-2 max-w-2xl text-brand-600">
          Retomas e carros de baixo valor de stands portugueses. Cada anúncio mostra o estado
          por área e os problemas declarados pelo vendedor.
        </p>
      </div>

      <div className="mb-6">
        <Suspense fallback={<div className="h-11 rounded-lg bg-brand-100" />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside>
          <Suspense fallback={<div className="h-96 rounded-card bg-brand-100" />}>
            <SearchFilters brands={brands} models={models} maxPrice={settings.max_price_eur} />
          </Suspense>
        </aside>

        <section aria-label="Resultados da pesquisa">
          <p className="mb-4 text-sm text-brand-600" role="status">
            {result.count === 0
              ? "Nenhum carro encontrado com estes filtros."
              : `${result.count} ${result.count === 1 ? "carro encontrado" : "carros encontrados"}`}
          </p>

          {result.items.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              <Pagination page={result.page} pageCount={result.pageCount} params={plain} />
            </>
          ) : (
            <div className="card p-10 text-center">
              <h2 className="font-heading text-lg font-bold">Sem resultados</h2>
              <p className="mt-2 text-brand-600">
                Experimente alargar o intervalo de preço, remover filtros ou pesquisar
                por outra marca.
              </p>
              <Link href="/carros" className="btn-outline mt-6">
                Limpar filtros
              </Link>
            </div>
          )}
        </section>
      </div>

      {(topBrands.length > 0 || topDistricts.length > 0 || topFuels.length > 0) && (
        <section aria-labelledby="explorar" className="mt-14 border-t border-brand-100 pt-10">
          <h2 id="explorar" className="font-heading text-xl font-extrabold tracking-tight">
            Explorar por categoria
          </h2>

          {topBrands.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-500">
                Por marca
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {topBrands.map((b) => (
                  <li key={b.slug}>
                    <Link href={`/carros/marca/${b.slug}`} className="btn-outline px-3 py-1.5 text-xs">
                      {b.name} ({b.count})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topDistricts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-500">
                Por distrito
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {topDistricts.map((d) => (
                  <li key={d.name}>
                    <Link
                      href={`/carros/distrito/${slugify(d.name)}`}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      {d.name} ({d.count})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topFuels.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-500">
                Por combustível
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {topFuels.map((f) => (
                  <li key={f.fuel}>
                    <Link
                      href={`/carros/combustivel/${f.fuel}`}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      {FUEL_LABELS[f.fuel as FuelType]} ({f.count})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
