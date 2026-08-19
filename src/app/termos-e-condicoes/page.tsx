import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section } from "@/components/LegalPage";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Termos e condições",
  description:
    "Termos e condições de utilização da plataforma AutoRetoma (versão provisória do MVP).",
  alternates: { canonical: `${SITE_URL}/termos-e-condicoes` },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos e condições"
      intro="Condições de utilização da plataforma AutoRetoma por compradores e por vendedores profissionais."
    >
      <Section title="1. Objeto e natureza da plataforma">
        <p>
          A AutoRetoma é uma plataforma de divulgação de veículos usados e de contacto
          entre compradores interessados e vendedores profissionais (adiante,
          &quot;stands&quot;). A AutoRetoma não é proprietária dos veículos anunciados, não
          intervém na negociação, não recebe pagamentos relativos à compra e venda e não é
          parte no contrato celebrado entre comprador e stand.
        </p>
        <p>
          O contrato de compra e venda é celebrado direta e exclusivamente entre o
          comprador e o stand vendedor identificado em cada anúncio.
        </p>
      </Section>

      <Section title="2. Acesso e utilização">
        <p>
          A consulta dos anúncios é livre e gratuita. A publicação de anúncios está
          reservada a vendedores profissionais registados e aprovados pela AutoRetoma.
          Nesta fase não são aceites anúncios de particulares.
        </p>
      </Section>

      <Section title="3. Registo de vendedores profissionais">
        <p>
          O registo exige a indicação do nome comercial, denominação social, NIF, nome do
          responsável, contactos e morada. O registo fica em estado &quot;a aguardar
          verificação&quot; até validação pela AutoRetoma, que se reserva o direito de
          recusar ou suspender registos que não correspondam a vendedores profissionais ou
          que violem estas condições.
        </p>
      </Section>

      <Section title="4. Responsabilidade pelo conteúdo dos anúncios">
        <p>
          O stand é o único responsável pela veracidade, exatidão e atualidade da
          informação publicada, incluindo características técnicas, quilometragem, estado
          da viatura, defeitos declarados, estimativas de reparação e fotografias.
        </p>
        <p>
          O stand obriga-se a declarar os defeitos conhecidos da viatura e a utilizar
          fotografias reais que reflitam o estado atual do veículo. A moderação efetuada
          pela AutoRetoma incide sobre o cumprimento formal destas regras e não constitui
          uma inspeção técnica nem uma garantia sobre o estado do veículo.
        </p>
      </Section>

      <Section title="5. Direitos do consumidor e garantia legal">
        <p>
          A declaração de defeitos num anúncio destina-se a informar o comprador e não
          afasta nem limita os direitos que a lei confere ao consumidor. Os bens móveis
          usados vendidos por um profissional a um consumidor beneficiam de garantia legal
          de conformidade; o prazo de três anos pode ser reduzido para 18 meses mediante
          acordo entre as partes, nos termos legalmente admitidos.
        </p>
        <p>
          Não é permitida, nos anúncios ou em qualquer comunicação na plataforma, a
          utilização de expressões que pretendam excluir a responsabilidade do vendedor ou
          a renúncia do comprador aos seus direitos.
        </p>
      </Section>

      <Section title="6. Conteúdos proibidos">
        <p>
          É proibida a publicação de anúncios com informação falsa ou enganosa, fotografias
          que não correspondam ao veículo, dados de terceiros sem autorização, conteúdos
          ilícitos ou ofensivos, bem como a omissão deliberada de defeitos conhecidos.
        </p>
      </Section>

      <Section title="7. Suspensão e cancelamento">
        <p>
          A AutoRetoma pode recusar, alterar o estado ou remover anúncios que violem estas
          condições e suspender contas de stands em caso de incumprimento reiterado,
          mediante comunicação ao titular.
        </p>
      </Section>

      <Section title="8. Limitação de responsabilidade da plataforma">
        <p>
          Sem prejuízo das responsabilidades que a lei lhe imponha enquanto prestador de
          serviços da sociedade da informação, a AutoRetoma não responde pelo estado dos
          veículos, pelo cumprimento dos contratos celebrados entre comprador e stand, nem
          por prejuízos decorrentes da informação prestada pelos stands.
        </p>
      </Section>

      <Section title="9. Lei aplicável e foro">
        <p>
          Estas condições regem-se pela lei portuguesa. Para a resolução de litígios é
          competente o foro legalmente estabelecido, sem prejuízo do recurso aos meios de{" "}
          <Link href="/resolucao-de-litigios" className="underline">
            resolução alternativa de litígios
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
