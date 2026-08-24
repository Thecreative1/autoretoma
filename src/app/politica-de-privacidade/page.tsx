import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Lei, Section } from "@/components/LegalPage";
import { OPERATOR, OPERATOR_IDENTIFIED, SITE_EMAIL, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como a AutoRetoma trata os dados pessoais de compradores e vendedores profissionais, ao abrigo do RGPD.",
  alternates: { canonical: `${SITE_URL}/politica-de-privacidade` },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidade"
      intro="Informação sobre o tratamento de dados pessoais na plataforma AutoRetoma, nos termos do Regulamento Geral sobre a Proteção de Dados."
    >
      <Section title="1. Responsável pelo tratamento">
        {OPERATOR_IDENTIFIED ? (
          <p>
            O responsável pelo tratamento é <strong>{OPERATOR.legalName}</strong>, NIF{" "}
            {OPERATOR.taxId}, com sede em {OPERATOR.address}, contactável através de{" "}
            <a href={`mailto:${SITE_EMAIL}`} className="underline">
              {SITE_EMAIL}
            </a>
            .
          </p>
        ) : (
          <p>
            O responsável pelo tratamento dos dados recolhidos através desta plataforma é a
            entidade que explora a AutoRetoma, contactável através de{" "}
            <a href={`mailto:${SITE_EMAIL}`} className="underline">
              {SITE_EMAIL}
            </a>{" "}
            ou da{" "}
            <Link href="/contactos" className="underline">
              página de contactos
            </Link>
            .
          </p>
        )}
        <p>
          O tratamento rege-se pelo{" "}
          <Lei href="https://eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX:32016R0679">Regulamento (UE) 2016/679</Lei> (Regulamento Geral
          sobre a Proteção de Dados) e pela{" "}
          <Lei href="https://diariodarepublica.pt/dr/detalhe/lei/58-2019-123815982">Lei n.º 58/2019, de 8 de agosto</Lei>, que
          assegura a sua execução na ordem jurídica portuguesa.
        </p>
      </Section>

      <Section title="2. Que dados recolhemos">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Pedidos de contacto (compradores):</strong> nome, email, telefone
            (opcional) e mensagem; um código derivado do endereço IP (não reversível),
            utilizado apenas para limitar pedidos repetidos e combater spam.
          </li>
          <li>
            <strong>Registo de stands:</strong> nome comercial, denominação social, NIF,
            nome do responsável, email, telefone, WhatsApp, morada, distrito, website e
            logótipo.
          </li>
          <li>
            <strong>Conteúdo dos anúncios:</strong> dados da viatura, fotografias e
            informação sobre o estado e defeitos declarados.
          </li>
          <li>
            <strong>Dados técnicos:</strong> cookies estritamente necessários para manter a
            sessão iniciada e garantir a segurança.
          </li>
        </ul>
      </Section>

      <Section title="3. Finalidades e fundamentos de licitude">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Transmitir ao stand vendedor o pedido de contacto do comprador — consentimento
            expresso recolhido no formulário (artigo 6.º, n.º 1, alínea a, do RGPD).
          </li>
          <li>
            Gerir o registo, a verificação e a conta dos vendedores profissionais —
            execução do contrato de utilização da plataforma (artigo 6.º, n.º 1, alínea b).
          </li>
          <li>
            Moderar anúncios, prevenir fraude e abuso — interesse legítimo em garantir a
            fiabilidade da plataforma (artigo 6.º, n.º 1, alínea f).
          </li>
          <li>Cumprir obrigações legais aplicáveis (artigo 6.º, n.º 1, alínea c).</li>
        </ul>
      </Section>

      <Section title="4. Destinatários">
        <p>
          Os dados incluídos num pedido de contacto são transmitidos ao stand identificado
          no anúncio, que passa a ser responsável pelo tratamento subsequente desses dados
          para resposta ao pedido. A plataforma recorre a fornecedores de alojamento e de
          base de dados que atuam como subcontratantes.
        </p>
      </Section>

      <Section title="5. Prazos de conservação">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Pedidos de contacto:</strong> dois anos a contar do último contacto,
            findos os quais são eliminados.
          </li>
          <li>
            <strong>Registo e dados dos stands:</strong> enquanto a conta se mantiver ativa
            e, após o encerramento, durante os prazos legais de conservação aplicáveis.
          </li>
          <li>
            <strong>Anúncios:</strong> enquanto publicados e, depois de arquivados, enquanto
            forem necessários para prova do cumprimento das regras da plataforma.
          </li>
        </ul>
      </Section>

      <Section title="6. Direitos dos titulares">
        <p>
          Pode solicitar o acesso, retificação, apagamento, limitação do tratamento,
          portabilidade e oposição, bem como retirar o consentimento a qualquer momento,
          sem prejuízo da licitude do tratamento anterior. Os pedidos devem ser dirigidos
          através da{" "}
          <Link href="/contactos" className="underline">página de contactos</Link>.
        </p>
        <p>
          Estes direitos estão previstos nos artigos 15.º a 22.º do RGPD. Tem ainda o
          direito de apresentar reclamação junto da autoridade de controlo, que em Portugal
          é a{" "}
          <a
            href="https://www.cnpd.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Comissão Nacional de Proteção de Dados
          </a>
          .
        </p>
      </Section>

      <Section title="7. Segurança">
        <p>
          A plataforma aplica medidas técnicas e organizativas adequadas, incluindo controlo
          de acessos ao nível da base de dados, validação dos dados submetidos, restrições
          aos ficheiros carregados e registo das ações administrativas relevantes.
        </p>
      </Section>
    </LegalPage>
  );
}
