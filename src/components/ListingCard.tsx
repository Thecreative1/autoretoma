import Image from "next/image";
import Link from "next/link";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { FUEL_LABELS, LISTING_STATUS_META } from "@/lib/constants";
import { formatMileage, formatPrice, isInspectionValid } from "@/lib/utils";

export function ListingCard({ listing }: { listing: ListingCardType }) {
  const cover =
    [...listing.photos].sort((a, b) => a.sort_order - b.sort_order).find((p) => !p.is_defect) ??
    listing.photos[0];
  const issueCount = listing.issues?.length ?? 0;
  const statusMeta = LISTING_STATUS_META[listing.status];
  const isSold = listing.status === "vendido";

  return (
    <article className="card group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={`/carros/${listing.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-brand-100"
      >
        {cover ? (
          <Image
            src={cover.url}
            alt={`${listing.brand.name} ${listing.model.name} ${listing.year}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
              isSold ? "opacity-60" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-400">
            Sem fotografia
          </div>
        )}
        <span
          className={`badge absolute left-3 top-3 ${statusMeta.badge}`}
        >
          {statusMeta.label}
        </span>
        {listing.featured && (
          <span className="badge absolute right-3 top-3 bg-accent-500 text-white">Destaque</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base font-bold leading-tight text-brand-900">
          <Link href={`/carros/${listing.slug}`} className="hover:text-accent-600">
            {listing.brand.name} {listing.model.name}
          </Link>
        </h3>
        {listing.version && (
          <p className="mt-0.5 line-clamp-1 text-sm text-brand-500">{listing.version}</p>
        )}

        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm text-brand-600">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Ano</dt>
            <dd>{listing.year}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Quilómetros</dt>
            <dd>{formatMileage(listing.mileage)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Combustível</dt>
            <dd>{FUEL_LABELS[listing.fuel]}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Localização</dt>
            <dd className="line-clamp-1">{listing.municipality ?? listing.district}</dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {issueCount > 0 ? (
            <span className="badge bg-amber-100 text-amber-800">
              {issueCount} {issueCount === 1 ? "problema declarado" : "problemas declarados"}
            </span>
          ) : (
            <span className="badge bg-green-100 text-green-800">Sem problemas declarados</span>
          )}
          {isInspectionValid(listing.inspection_valid_until) && (
            <span className="badge bg-brand-100 text-brand-700">Inspeção válida</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="font-heading text-xl font-extrabold text-brand-900">
              {formatPrice(listing.price)}
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-brand-500">
              {listing.stand.commercial_name}
              {listing.stand.is_demo && " (demo)"}
            </p>
          </div>
          <Link
            href={`/carros/${listing.slug}`}
            className="shrink-0 text-sm font-semibold text-accent-600 hover:text-accent-700"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
