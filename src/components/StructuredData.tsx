import { OPERATOR, OPERATOR_IDENTIFIED, SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/constants";
import { jsonLdHtml } from "@/lib/utils";

/**
 * Dados estruturados de âmbito global (Organization + WebSite), injetados uma
 * vez no layout. Ajudam o Google a associar o nome, o logótipo e os contactos à
 * marca, e a `SearchAction` habilita a caixa de pesquisa da AutoRetoma nos
 * resultados. Os dados por anúncio (Car, Offer, AutoDealer) continuam a ser
 * gerados na própria página do anúncio.
 */
export function StructuredData() {
  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    email: SITE_EMAIL,
    description:
      "Marketplace português de retomas e carros usados de baixo valor vendidos por stands profissionais, com o estado de cada viatura apresentado de forma transparente.",
    areaServed: { "@type": "Country", name: "Portugal" },
  };

  // Só afirmamos a identidade jurídica quando ela existir de facto.
  if (OPERATOR_IDENTIFIED) {
    organization.legalName = OPERATOR.legalName;
    organization.vatID = OPERATOR.taxId;
    organization.address = {
      "@type": "PostalAddress",
      streetAddress: OPERATOR.address,
      addressCountry: "PT",
    };
  }

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "pt-PT",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/carros?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [organization, website],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
    />
  );
}
