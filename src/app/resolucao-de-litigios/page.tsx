import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Lei, Section } from "@/components/LegalPage";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Resolução alternativa de litígios",
  description:
    "Informação sobre resolução alternativa de litígios de consumo aplicável às compras feitas a stands anunciantes na AutoRetoma.",
  alternates: { canonical: `${SITE_URL}/resolucao-de-litigios` },
};

export default function DisputeResolutionPage() {
  return (
    <LegalPage
      title="Resolução alternativa de litígios"
      intro="Em caso de litígio de consumo, existem entidades de resolução alternativa às quais o consumidor pode recorrer."
    >
      <Section title="1. Litígios com o stand vendedor">
        <p>
          O contrato de compra e venda do veículo é celebrado entre o comprador e o stand
          vendedor. Assim, os litígios relativos ao veículo, ao preço, à entrega ou à
          garantia devem ser dirigidos, em primeiro lugar, ao stand identificado no anúncio.
        </p>
        <p>
          Nos termos da{" "}
          <Lei href="https://diariodarepublica.pt/dr/detalhe/lei/144-2015-70789875">Lei n.º 144/2015, de 8 de setembro</Lei>, que
          estabelece o regime da resolução alternativa de litígios de consumo, os vendedores
          profissionais estão obrigados a informar o consumidor sobre a entidade competente
          e a disponibilizar essa informação nos seus estabelecimentos e sítios na Internet.
        </p>
      </Section>

      <Section title="2. Entidades de resolução alternativa">
        <p>
          Em Portugal existem centros de arbitragem de conflitos de consumo com competência
          territorial e, em alguns casos, competência genérica de âmbito nacional. A lista
          atualizada das entidades autorizadas é mantida pela Direção-Geral do Consumidor,
          disponível em{" "}
          <a
            href="https://www.consumidor.gov.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            consumidor.gov.pt
          </a>
          .
        </p>
        <p className="rounded-lg bg-brand-50 p-4">
          A entidade concretamente competente depende do domicílio do consumidor e do local
          do estabelecimento do vendedor. Confirme junto do stand qual a entidade que este
          indica, ou consulte a lista mantida pela Direção-Geral do Consumidor.
        </p>
        <p>
          <strong>Nota sobre a plataforma europeia.</strong> A plataforma europeia de
          resolução de litígios em linha deixou de estar operacional a 20 de julho de 2025,
          por força do{" "}
          <Lei href="https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=OJ:L_202403228">Regulamento (UE) 2024/3228</Lei>. As ligações
          para essa plataforma, que ainda constam de muitos sítios portugueses, já não
          conduzem a lado nenhum.
        </p>
      </Section>

      <Section title="3. Litígios com a plataforma">
        <p>
          Se o litígio disser respeito ao funcionamento da plataforma AutoRetoma e não ao
          contrato de compra e venda, contacte-nos através da{" "}
          <Link href="/contactos" className="underline">página de contactos</Link>.
        </p>
      </Section>

      <Section title="4. Livro de Reclamações">
        <p>
          Está também disponível o Livro de Reclamações em formato eletrónico. Consulte a{" "}
          <Link href="/livro-de-reclamacoes" className="underline">
            página dedicada
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
