import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section } from "@/components/LegalPage";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como a AutoRetoma trata os dados pessoais de compradores e vendedores profissionais (versão provisória do MVP).",
  alternates: { canonical: `${SITE_URL}/politica-de-privacidade` },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidade"
      intro="Informação sobre o tratamento de dados pessoais na plataforma AutoRetoma, nos termos do Regulamento Geral sobre a Proteção de Dados."
    >
      <Section title="1. Responsável pelo tratamento">
        <p>
          O responsável pelo tratamento dos dados recolhidos através desta plataforma é a
          entidade que explora a AutoRetoma, contactável através da{" "}
          <Link href="/contactos" className="underline">página de contactos</Link>. Os
          dados de identificação completos da entidade responsável serão publicados nesta
          página antes do lançamento.
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
            Transmitir ao stand vendedor o pedido de contacto do comprador — com base no
            consentimento expresso recolhido no formulário.
          </li>
          <li>
            Gerir o registo, a verificação e a conta dos vendedores profissionais — com
            base na execução do contrato de utilização da plataforma.
          </li>
          <li>
            Moderar anúncios, prevenir fraude e abuso — com base no interesse legítimo em
            garantir a fiabilidade da plataforma.
          </li>
          <li>Cumprir obrigações legais aplicáveis.</li>
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
        <p>
          Os pedidos de contacto são conservados enquanto forem necessários à gestão do
          contacto comercial e, no máximo, durante o período que vier a ser fixado na
          versão final desta política. Os dados de registo dos stands são conservados
          enquanto a conta se mantiver ativa.
        </p>
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
          Tem ainda o direito de apresentar reclamação junto da Comissão Nacional de
          Proteção de Dados (CNPD).
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
