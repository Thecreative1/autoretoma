import type { Metadata } from "next";
import { LegalPage, Lei, Section } from "@/components/LegalPage";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de cookies",
  description:
    "Que cookies a AutoRetoma utiliza, para que servem e o que diz a lei portuguesa sobre o consentimento.",
  alternates: { canonical: `${SITE_URL}/politica-de-cookies` },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Política de cookies"
      intro="Nesta fase, a AutoRetoma utiliza apenas cookies estritamente necessários ao funcionamento da plataforma."
    >
      <Section title="1. O que são cookies">
        <p>
          Cookies são pequenos ficheiros guardados no seu dispositivo quando visita um
          site. Permitem, entre outras funções, manter a sessão iniciada e garantir a
          segurança das áreas privadas.
        </p>
        <p>
          A utilização de cookies está regulada pelo artigo 5.º da{" "}
          <Lei href="https://diariodarepublica.pt/dr/detalhe/lei/41-2004-495094">Lei n.º 41/2004, de 18 de agosto</Lei>. Segundo essa
          norma, os cookies estritamente necessários para prestar um serviço expressamente
          solicitado pelo utilizador estão dispensados de consentimento prévio; todos os
          outros exigem-no.
        </p>
      </Section>

      <Section title="2. Cookies utilizados">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-brand-200 text-left">
                <th className="py-2 pr-4 font-semibold text-brand-900">Cookie</th>
                <th className="py-2 pr-4 font-semibold text-brand-900">Finalidade</th>
                <th className="py-2 font-semibold text-brand-900">Categoria</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-brand-100">
                <td className="py-2 pr-4">Cookies de sessão de autenticação</td>
                <td className="py-2 pr-4">
                  Manter a sessão iniciada dos stands e administradores e proteger as áreas
                  privadas.
                </td>
                <td className="py-2">Estritamente necessários</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Preferência de aviso de cookies</td>
                <td className="py-2 pr-4">
                  Guardar localmente a decisão sobre o aviso de cookies para não o repetir.
                </td>
                <td className="py-2">Estritamente necessários</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. Cookies de análise e publicidade">
        <p>
          Nesta fase do projeto não são utilizados cookies de análise estatística,
          publicidade ou redes sociais. Caso venham a ser introduzidos, esta política será
          atualizada e será solicitado o consentimento prévio quando legalmente exigido.
        </p>
      </Section>

      <Section title="4. Como controlar os cookies">
        <p>
          Pode configurar o seu navegador para bloquear ou eliminar cookies. Note que, ao
          bloquear os cookies estritamente necessários, algumas funcionalidades — como o
          acesso ao painel do stand — deixarão de funcionar.
        </p>
      </Section>
    </LegalPage>
  );
}
