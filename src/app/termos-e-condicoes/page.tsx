import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Lei, Section } from "@/components/LegalPage";
import { OPERATOR, OPERATOR_IDENTIFIED, SITE_EMAIL, SITE_URL } from "@/lib/constants";

const DL_7_2004 = "https://diariodarepublica.pt/dr/detalhe/decreto-lei/7-2004-240775";
const DL_84_2021 = "https://diariodarepublica.pt/dr/detalhe/decreto-lei/84-2021-172938301";
const REG_P2B = "https://eur-lex.europa.eu/legal-content/PT/ALL/?uri=CELEX:32019R1150";
const REG_DSA = "https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32022R2065";
const LEI_144_2015 = "https://diariodarepublica.pt/dr/detalhe/lei/144-2015-70789875";

export const metadata: Metadata = {
  title: "Termos e condições",
  description:
    "Condições de utilização da AutoRetoma por compradores e por vendedores profissionais, com indicação da legislação aplicável.",
  alternates: { canonical: `${SITE_URL}/termos-e-condicoes` },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos e condições"
      intro="Condições de utilização da plataforma AutoRetoma por compradores e por vendedores profissionais."
    >
      <Section title="1. Identificação do prestador">
        {OPERATOR_IDENTIFIED ? (
          <p>
            A AutoRetoma é explorada por <strong>{OPERATOR.legalName}</strong>, com o
            número de identificação fiscal {OPERATOR.taxId} e sede em {OPERATOR.address}.
            Contacto:{" "}
            <a href={`mailto:${SITE_EMAIL}`} className="underline">
              {SITE_EMAIL}
            </a>
            .
          </p>
        ) : (
          <p>
            Contacto do prestador:{" "}
            <a href={`mailto:${SITE_EMAIL}`} className="underline">
              {SITE_EMAIL}
            </a>
            .
          </p>
        )}
        <p>
          Estes elementos são disponibilizados em cumprimento do artigo 10.º do{" "}
          <Lei href={DL_7_2004}>Decreto-Lei n.º 7/2004, de 7 de janeiro</Lei>, que
          estabelece o regime jurídico do comércio eletrónico e dos serviços da sociedade
          da informação.
        </p>
      </Section>

      <Section title="2. Objeto e natureza da plataforma">
        <p>
          A AutoRetoma é uma plataforma de divulgação de veículos usados e de contacto
          entre compradores interessados e vendedores profissionais (adiante,
          &quot;stands&quot;). A AutoRetoma não é proprietária dos veículos anunciados, não
          intervém na negociação, não recebe pagamentos relativos à compra e venda e não é
          parte no contrato celebrado entre comprador e stand.
        </p>
        <p>
          O contrato de compra e venda é celebrado direta e exclusivamente entre o
          comprador e o stand vendedor identificado em cada anúncio. A plataforma limita-se
          a armazenar e a apresentar conteúdos fornecidos pelos stands, atuando como
          serviço de alojamento na aceção do{" "}
          <Lei href={REG_DSA}>Regulamento (UE) 2022/2065</Lei> (Regulamento dos Serviços
          Digitais).
        </p>
      </Section>

      <Section title="3. Acesso e utilização">
        <p>
          A consulta dos anúncios é livre e gratuita. A publicação de anúncios está
          reservada a vendedores profissionais registados e aprovados pela AutoRetoma.
          Nesta fase não são aceites anúncios de particulares.
        </p>
      </Section>

      <Section title="4. Registo de vendedores profissionais">
        <p>
          O registo exige a indicação do nome comercial, denominação social, NIF, nome do
          responsável, contactos e morada. O registo fica em estado &quot;a aguardar
          verificação&quot; até validação pela AutoRetoma, que se reserva o direito de
          recusar ou suspender registos que não correspondam a vendedores profissionais ou
          que violem estas condições.
        </p>
      </Section>

      <Section title="5. Responsabilidade pelo conteúdo dos anúncios">
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

      <Section title="6. Direitos do consumidor e garantia legal">
        <p>
          A declaração de defeitos num anúncio destina-se a informar o comprador e não
          afasta nem limita os direitos que a lei confere ao consumidor.
        </p>
        <p>
          Nos termos do{" "}
          <Lei href={DL_84_2021}>Decreto-Lei n.º 84/2021, de 18 de outubro</Lei>, que
          regula os direitos do consumidor na compra e venda de bens, os bens móveis usados
          vendidos por um profissional a um consumidor beneficiam de garantia legal de
          conformidade pelo prazo de <strong>três anos</strong>. Esse prazo pode ser
          reduzido para um mínimo de <strong>18 meses</strong> por acordo expresso entre as
          partes; nesse caso, reduz-se também para um ano o período durante o qual se
          presume que a falta de conformidade já existia à data da entrega.
        </p>
        <p>
          Não é permitida, nos anúncios ou em qualquer comunicação na plataforma, a
          utilização de expressões que pretendam excluir a responsabilidade do vendedor ou
          a renúncia do comprador aos seus direitos. Veja também a página{" "}
          <Link href="/vendedores-profissionais" className="underline">
            informação sobre vendedores profissionais
          </Link>
          .
        </p>
      </Section>

      <Section title="7. Conteúdos proibidos e sinalização">
        <p>
          É proibida a publicação de anúncios com informação falsa ou enganosa, fotografias
          que não correspondam ao veículo, dados de terceiros sem autorização, conteúdos
          ilícitos ou ofensivos, bem como a omissão deliberada de defeitos conhecidos.
        </p>
        <p>
          Qualquer pessoa pode sinalizar um anúncio que considere ilícito ou desconforme,
          através da{" "}
          <Link href="/contactos" className="underline">
            página de contactos
          </Link>
          , indicando o endereço do anúncio e o motivo. A AutoRetoma aprecia a comunicação
          e informa quem a apresentou da decisão tomada e da respetiva fundamentação.
        </p>
      </Section>

      <Section title="8. Ordenação, suspensão e reclamações dos stands">
        <p>
          Enquanto serviço de intermediação em linha, a AutoRetoma está sujeita ao{" "}
          <Lei href={REG_P2B}>Regulamento (UE) 2019/1150</Lei>, relativo à equidade e
          transparência para os utilizadores profissionais, cujo incumprimento é sancionado
          em Portugal pelo Decreto-Lei n.º 68/2023, de 16 de agosto. Em cumprimento desse
          regime, informa-se o seguinte.
        </p>
        <p>
          <strong>Ordenação dos anúncios.</strong> Os anúncios assinalados pela AutoRetoma
          como destacados são apresentados em primeiro lugar em todas as listagens,
          qualquer que seja a ordenação escolhida pelo comprador. Dentro de cada grupo, a
          ordenação por omissão é a data de publicação, do mais recente para o mais antigo,
          podendo o comprador escolher em alternativa preço mais baixo, preço mais alto,
          menos quilómetros ou ano mais recente.
        </p>
        <p>
          O destaque é atribuído manualmente pela AutoRetoma e{" "}
          <strong>não pode ser comprado</strong>: não existe qualquer pagamento,
          contrapartida ou remuneração, direta ou indireta, que permita a um stand
          influenciar a posição dos seus anúncios. Se esta regra vier a mudar, estas
          condições serão atualizadas e os stands informados com a antecedência exigida por
          lei.
        </p>
        <p>
          <strong>Restrição, suspensão e cessação.</strong> A AutoRetoma pode recusar,
          alterar o estado ou remover anúncios que violem estas condições e suspender ou
          encerrar contas de stands em caso de incumprimento. A decisão é comunicada ao
          stand por escrito, com indicação dos motivos que a fundamentam.
        </p>
        <p>
          <strong>Reclamações.</strong> O stand que discorde de uma decisão pode contestá-la
          escrevendo para{" "}
          <a href={`mailto:${SITE_EMAIL}`} className="underline">
            {SITE_EMAIL}
          </a>
          . A AutoRetoma responde por escrito e de forma fundamentada.
        </p>
      </Section>

      <Section title="9. Limitação de responsabilidade da plataforma">
        <p>
          Sem prejuízo das responsabilidades que a lei lhe imponha enquanto prestador de
          serviços da sociedade da informação, designadamente nos termos do{" "}
          <Lei href={DL_7_2004}>Decreto-Lei n.º 7/2004</Lei> e do{" "}
          <Lei href={REG_DSA}>Regulamento (UE) 2022/2065</Lei>, a AutoRetoma não responde
          pelo estado dos veículos, pelo cumprimento dos contratos celebrados entre
          comprador e stand, nem por prejuízos decorrentes da informação prestada pelos
          stands.
        </p>
      </Section>

      <Section title="10. Lei aplicável e resolução de litígios">
        <p>
          Estas condições regem-se pela lei portuguesa. Sem prejuízo do direito de recurso
          aos tribunais, os litígios de consumo podem ser submetidos às entidades de
          resolução alternativa previstas na{" "}
          <Lei href={LEI_144_2015}>Lei n.º 144/2015, de 8 de setembro</Lei>. Consulte a
          página{" "}
          <Link href="/resolucao-de-litigios" className="underline">
            resolução alternativa de litígios
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
