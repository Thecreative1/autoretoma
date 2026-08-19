import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section } from "@/components/LegalPage";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Informação sobre vendedores profissionais",
  description:
    "Quem vende na AutoRetoma, que obrigações tem e que direitos assistem ao consumidor na compra de veículos usados a profissionais.",
  alternates: { canonical: `${SITE_URL}/vendedores-profissionais` },
};

export default function ProfessionalSellersPage() {
  return (
    <LegalPage
      title="Informação sobre vendedores profissionais"
      intro="Na AutoRetoma todos os anúncios são publicados por vendedores profissionais identificados. Esta página explica o que isso significa para quem compra."
    >
      <Section title="1. Quem pode anunciar">
        <p>
          Nesta fase, apenas stands automóveis, concessionários e empresas com retomas ou
          veículos de baixo valor podem publicar anúncios. Não são aceites anúncios de
          particulares. Cada registo é verificado antes de o stand poder publicar.
        </p>
      </Section>

      <Section title="2. Identificação do vendedor">
        <p>
          Todos os anúncios identificam o stand responsável pela venda, com nome comercial,
          localização e contactos. O comprador sabe sempre com quem está a negociar antes
          de estabelecer contacto.
        </p>
      </Section>

      <Section title="3. Obrigações do stand na plataforma">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Declarar os defeitos conhecidos da viatura, por área e com descrição.</li>
          <li>Utilizar fotografias reais que mostrem o estado atual do veículo.</li>
          <li>Indicar corretamente quilometragem, ano, combustível e demais características.</li>
          <li>Informar sobre a validade da inspeção periódica, quando aplicável.</li>
          <li>Manter o estado do anúncio atualizado (disponível, reservado ou vendido).</li>
        </ul>
      </Section>

      <Section title="4. Garantia legal na venda de bens usados">
        <p>
          Os bens móveis usados vendidos por um profissional a um consumidor beneficiam de
          garantia legal de conformidade. O prazo de três anos pode ser reduzido para 18
          meses mediante acordo entre as partes, nos termos legalmente admitidos.
        </p>
        <p>
          A declaração de defeitos num anúncio serve para informar o comprador antes da
          compra. Não constitui, por si só, uma renúncia do consumidor aos seus direitos
          nem uma exclusão da responsabilidade do vendedor.
        </p>
        <p className="rounded-lg bg-brand-50 p-4">
          Este enquadramento é apresentado a título informativo e provisório. O texto final
          será revisto por advogado português antes do lançamento e deve ser confirmado
          junto do vendedor e, se necessário, de aconselhamento jurídico próprio.
        </p>
      </Section>

      <Section title="5. Expressões não permitidas">
        <p>
          Não são admitidas nos anúncios expressões que procurem afastar a responsabilidade
          do vendedor ou sugerir a renúncia do comprador aos seus direitos, tais como
          &quot;sem garantia&quot;, &quot;não se aceitam reclamações&quot;, &quot;vendido
          como está e sem qualquer responsabilidade&quot; ou &quot;o comprador renuncia aos
          seus direitos&quot;.
        </p>
      </Section>

      <Section title="6. Papel da AutoRetoma">
        <p>
          A AutoRetoma é a plataforma de divulgação e contacto. Não é proprietária nem
          vendedora dos veículos anunciados. O contrato de compra e venda é celebrado
          diretamente entre o comprador e o stand vendedor. Em caso de conflito, consulte a
          página de{" "}
          <Link href="/resolucao-de-litigios" className="underline">
            resolução alternativa de litígios
          </Link>{" "}
          e o{" "}
          <Link href="/livro-de-reclamacoes" className="underline">
            Livro de Reclamações
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
