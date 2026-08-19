import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import type { ListingCard as ListingCardType } from "@/lib/types";

/**
 * Página indexável por marca, distrito ou combustível. Só é criada quando
 * existirem anúncios suficientes (ver definições da plataforma).
 */
export function FacetPage({
  title,
  intro,
  listings,
  searchHref,
  breadcrumb,
}: {
  title: string;
  intro: string;
  listings: ListingCardType[];
  searchHref: string;
  breadcrumb: string;
}) {
  return (
    <div className="container-site py-8 lg:py-12">
      <nav aria-label="Caminho" className="mb-5 text-sm text-brand-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-accent-600">Início</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/carros" className="hover:text-accent-600">Ver carros</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-brand-800">{breadcrumb}</li>
        </ol>
      </nav>

      <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-brand-600">{intro}</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      <div className="mt-10">
        <Link href={searchHref} className="btn-primary">
          Ver com todos os filtros
        </Link>
      </div>
    </div>
  );
}
