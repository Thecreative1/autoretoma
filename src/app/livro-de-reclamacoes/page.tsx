import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section } from "@/components/LegalPage";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Livro de Reclamações",
  description:
    "Como apresentar uma reclamação relativa à plataforma AutoRetoma ou a um stand anunciante.",
  alternates: { canonical: `${SITE_URL}/livro-de-reclamacoes` },
};

export default function ComplaintsPage() {
  return (
    <LegalPage
      title="Livro de Reclamações"
      intro="O Livro de Reclamações eletrónico permite apresentar reclamações contra fornecedores de bens e prestadores de serviços."
    >
      <Section title="1. Livro de Reclamações eletrónico">
        <p>
          O Livro de Reclamações em formato eletrónico está disponível na plataforma oficial
          gerida pelo Estado português:
        </p>
        <p>
          <a
            href="https://www.livroreclamacoes.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-2"
          >
            Aceder ao Livro de Reclamações
          </a>
        </p>
        <p className="mt-3 text-xs text-brand-500">
          Ligação para o sítio oficial livroreclamacoes.pt, gerido pela Administração
          Pública.
        </p>
      </Section>

      <Section title="2. Reclamação contra o stand vendedor">
        <p>
          Se a reclamação disser respeito ao veículo, ao processo de venda ou à garantia,
          deve ser apresentada contra o stand vendedor identificado no anúncio, que é a
          entidade responsável pela venda. Todos os anúncios da AutoRetoma identificam o
          vendedor profissional responsável.
        </p>
      </Section>

      <Section title="3. Reclamação relativa à plataforma">
        <p>
          Se a reclamação disser respeito ao funcionamento da AutoRetoma — por exemplo, a um
          anúncio que considere enganoso ou a um problema técnico — pode utilizar o Livro de
          Reclamações eletrónico ou contactar-nos diretamente através da{" "}
          <Link href="/contactos" className="underline">página de contactos</Link>. Anúncios
          que violem as regras da plataforma podem ser removidos após análise.
        </p>
      </Section>

      <Section title="4. Resolução alternativa de litígios">
        <p>
          Antes ou em paralelo com a reclamação, pode recorrer aos meios de{" "}
          <Link href="/resolucao-de-litigios" className="underline">
            resolução alternativa de litígios de consumo
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
