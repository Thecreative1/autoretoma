import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Gallery } from "@/components/listing/Gallery";
import { ConditionReport } from "@/components/listing/ConditionReport";
import { ContactPanel } from "@/components/listing/ContactPanel";
import { getListingBySlug } from "@/lib/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  FUEL_LABELS,
  GEARBOX_LABELS,
  LISTING_STATUS_META,
  SITE_URL,
} from "@/lib/constants";
import {
  formatDate,
  formatMileage,
  formatMonthYear,
  formatNumber,
  formatPrice,
  isInspectionValid,
  jsonLdHtml,
} from "@/lib/utils";

type Params = Promise<{ slug: string }>;

function listingTitle(l: Awaited<ReturnType<typeof getListingBySlug>>): string {
  if (!l) return "";
  return `${l.brand.name} ${l.model.name}${l.version ? ` ${l.version}` : ""} (${l.year})`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Anúncio não encontrado" };

  const title = `${listing.brand.name} ${listing.model.name} ${listing.year} — ${formatPrice(
    listing.price
  )}`;
  const issueCount = listing.issues.length;
  const description = `${listing.brand.name} ${listing.model.name}${
    listing.version ? ` ${listing.version}` : ""
  }, ${listing.year}, ${formatMileage(listing.mileage)}, ${FUEL_LABELS[listing.fuel]}, em ${
    listing.municipality ?? listing.district
  }. ${
    issueCount > 0
      ? `${issueCount} ${issueCount === 1 ? "problema declarado" : "problemas declarados"} pelo stand.`
      : "Sem problemas declarados pelo stand."
  } Vendido por ${listing.stand.commercial_name}.`;

  const cover = listing.photos.find((p) => !p.is_defect)?.url ?? listing.photos[0]?.url;
  const canonical = `${SITE_URL}/carros/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      images: cover ? [{ url: cover.startsWith("http") ? cover : `${SITE_URL}${cover}` }] : undefined,
    },
  };
}

export default async function ListingPage({ params }: { params: Params }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  // Contador de visualizações (não bloqueia a renderização em caso de falha)
  try {
    await createAdminClient().rpc("increment_listing_views", { p_listing_id: listing.id });
  } catch (error) {
    console.error("increment_listing_views:", error);
  }

  const title = listingTitle(listing);
  const statusMeta = LISTING_STATUS_META[listing.status];
  const inspectionValid = isInspectionValid(listing.inspection_valid_until);
  const cover = listing.photos.find((p) => !p.is_defect)?.url ?? listing.photos[0]?.url;

  const specs: { label: string; value: string }[] = [
    { label: "Marca", value: listing.brand.name },
    { label: "Modelo", value: listing.model.name },
    ...(listing.version ? [{ label: "Versão", value: listing.version }] : []),
    { label: "Ano e mês", value: formatMonthYear(listing.year, listing.month) },
    { label: "Quilómetros", value: formatMileage(listing.mileage) },
    { label: "Combustível", value: FUEL_LABELS[listing.fuel] },
    ...(listing.displacement_cc
      ? [{ label: "Cilindrada", value: `${formatNumber(listing.displacement_cc)} cm³` }]
      : []),
    ...(listing.power_hp ? [{ label: "Potência", value: `${listing.power_hp} cv` }] : []),
    { label: "Caixa", value: GEARBOX_LABELS[listing.gearbox] },
    ...(listing.doors ? [{ label: "Portas", value: String(listing.doors) }] : []),
    {
      label: "Localização",
      value: listing.municipality ? `${listing.municipality}, ${listing.district}` : listing.district,
    },
    {
      label: "Inspeção",
      value: listing.inspection_valid_until
        ? `${inspectionValid ? "Válida até" : "Expirou em"} ${formatDate(listing.inspection_valid_until)}`
        : "Não indicada",
    },
    ...(listing.keys_count != null
      ? [{ label: "Número de chaves", value: String(listing.keys_count) }]
      : []),
    ...(listing.owners_count != null
      ? [{ label: "Proprietários", value: String(listing.owners_count) }]
      : []),
  ];

  // Dados estruturados: veículo + oferta
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    brand: { "@type": "Brand", name: listing.brand.name },
    model: listing.model.name,
    vehicleModelDate: String(listing.year),
    productionDate: String(listing.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: listing.mileage, unitCode: "KMT" },
    fuelType: FUEL_LABELS[listing.fuel],
    vehicleTransmission: GEARBOX_LABELS[listing.gearbox],
    ...(listing.doors ? { numberOfDoors: listing.doors } : {}),
    ...(listing.displacement_cc
      ? {
          vehicleEngine: {
            "@type": "EngineSpecification",
            engineDisplacement: {
              "@type": "QuantitativeValue",
              value: listing.displacement_cc,
              unitCode: "CMQ",
            },
            ...(listing.power_hp
              ? {
                  enginePower: {
                    "@type": "QuantitativeValue",
                    value: listing.power_hp,
                    unitCode: "BHP",
                  },
                }
              : {}),
          },
        }
      : {}),
    itemCondition: "https://schema.org/UsedCondition",
    ...(cover ? { image: cover.startsWith("http") ? cover : `${SITE_URL}${cover}` } : {}),
    description: listing.description ?? title,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "EUR",
      url: `${SITE_URL}/carros/${slug}`,
      itemCondition: "https://schema.org/UsedCondition",
      availability:
        listing.status === "publicado"
          ? "https://schema.org/InStock"
          : listing.status === "reservado"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/SoldOut",
      seller: {
        "@type": "AutoDealer",
        name: listing.stand.commercial_name,
        address: {
          "@type": "PostalAddress",
          streetAddress: listing.stand.address,
          addressRegion: listing.stand.district,
          addressCountry: "PT",
        },
        telephone: listing.stand.phone,
      },
      areaServed: { "@type": "Country", name: "Portugal" },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Ver carros", item: `${SITE_URL}/carros` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/carros/${slug}` },
    ],
  };

  return (
    <div className="container-site py-6 lg:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbLd) }}
      />

      <nav aria-label="Caminho" className="mb-5 text-sm text-brand-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-accent-600">Início</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/carros" className="hover:text-accent-600">Ver carros</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-brand-800">{listing.brand.name} {listing.model.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <Gallery photos={listing.photos} title={title} />

          <section aria-labelledby="informacao-principal" className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 id="informacao-principal" className="font-heading text-2xl font-extrabold leading-tight sm:text-3xl">
                  {listing.brand.name} {listing.model.name}
                </h1>
                {listing.version && (
                  <p className="mt-1 text-lg text-brand-600">{listing.version}</p>
                )}
              </div>
              <span className={`badge ${statusMeta.badge}`}>{statusMeta.label}</span>
            </div>

            <p className="mt-4 font-heading text-3xl font-extrabold text-brand-900">
              {formatPrice(listing.price)}
            </p>

            <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-3 border-b border-brand-100 pb-2">
                  <dt className="text-sm text-brand-500">{spec.label}</dt>
                  <dd className="text-right text-sm font-semibold text-brand-900">{spec.value}</dd>
                </div>
              ))}
            </dl>

            {listing.maintenance_history && (
              <div className="mt-6">
                <h2 className="font-heading text-base font-bold">Histórico de manutenção conhecido</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brand-700">
                  {listing.maintenance_history}
                </p>
              </div>
            )}

            {listing.description && (
              <div className="mt-6">
                <h2 className="font-heading text-base font-bold">Descrição do stand</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brand-700">
                  {listing.description}
                </p>
              </div>
            )}
          </section>

          <ConditionReport conditions={listing.conditions} issues={listing.issues} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <ContactPanel listing={listing} title={title} />

          <div className="card p-5 text-xs leading-relaxed text-brand-600">
            <h2 className="font-heading text-sm font-bold text-brand-900">Antes de avançar</h2>
            <ul className="mt-3 space-y-2">
              <li>A viatura é vendida pelo stand identificado, não pela AutoRetoma.</li>
              <li>Os bens usados vendidos por profissionais a consumidores têm garantia legal.</li>
              <li>Confirma sempre o estado da viatura presencialmente antes de fechares negócio.</li>
            </ul>
            <Link href="/vendedores-profissionais" className="mt-3 inline-block font-semibold underline">
              Informação sobre vendedores profissionais
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
