import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Para stands — publique as suas retomas",
  description:
    "Publique na AutoRetoma os carros de retoma e de baixo valor que não quer promover no stock principal e encontre compradores interessados.",
  alternates: { canonical: `${SITE_URL}/para-stands` },
};

const BENEFITS = [
  {
    title: "Carros que não encaixam no stock principal",
    text: "Retomas, viaturas antigas e carros com defeitos que não quer mostrar ao lado do seu stock premium.",
  },
  {
    title: "Compradores que procuram exatamente isto",
    text: "Quem entra na AutoRetoma sabe que vai encontrar carros baratos com defeitos declarados. Menos visitas perdidas.",
  },
  {
    title: "Contactos diretos, sem comissões",
    text: "Os pedidos de contacto chegam ao seu painel com nome, email, telefone e mensagem. O negócio é seu, do princípio ao fim.",
  },
  {
    title: "Menos tempo a explicar o óbvio",
    text: "Se o carro tem a embraiagem no fim ou ferrugem num guarda-lamas, isso está escrito no anúncio. Quem liga já sabe.",
  },
];

const STEPS = [
  "Registe o stand com os dados da empresa e do responsável.",
  "Aguarde a verificação — validamos que se trata de um vendedor profissional.",
  "Crie o anúncio em seis passos, com fotografias e problemas declarados.",
  "Envie para aprovação. Depois de aprovado, o anúncio fica visível na pesquisa.",
  "Receba os contactos no painel e marque o carro como reservado ou vendido.",
];

export default async function ForDealersPage() {
  const settings = await getSettings();

  return (
    <div className="container-site max-w-4xl py-10 lg:py-16">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
        Tem retomas paradas no parque?
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-brand-600">
        Publique os carros que não quer promover no seu stock principal e encontre
        compradores interessados em veículos de baixo valor.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/registar" className="btn-primary px-7 py-3 text-base">
          Registar o meu stand
        </Link>
        <Link href="/entrar" className="btn-outline px-7 py-3 text-base">
          Já tenho conta
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">
          Porquê publicar aqui
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card p-6">
              <h3 className="font-heading text-base font-bold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-600">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">
          Como publicar
        </h2>
        <ol className="mt-6 space-y-3">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-4 rounded-card border border-brand-100 bg-white p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-brand-700">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">
          Regras de publicação
        </h2>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-brand-700">
          <li className="rounded-lg border border-brand-100 bg-white p-4">
            <strong className="text-brand-900">Apenas vendedores profissionais.</strong>{" "}
            Nesta fase não são aceites anúncios de particulares.
          </li>
          <li className="rounded-lg border border-brand-100 bg-white p-4">
            <strong className="text-brand-900">
              Preço até {formatPrice(settings.max_price_eur)}.
            </strong>{" "}
            O limite é definido pela plataforma e pode ser ajustado.
          </li>
          <li className="rounded-lg border border-brand-100 bg-white p-4">
            <strong className="text-brand-900">
              Mínimo de {settings.min_photos} fotografias reais.
            </strong>{" "}
            Frontal, traseira, as duas laterais, interior, quadrante com quilómetros e motor.
            Fotografias dos defeitos declarados sempre que existirem.
          </li>
          <li className="rounded-lg border border-brand-100 bg-white p-4">
            <strong className="text-brand-900">Defeitos conhecidos declarados.</strong>{" "}
            Se o stand conhece um problema, tem de o descrever. É esta a razão de existir
            da plataforma.
          </li>
          <li className="rounded-lg border border-brand-100 bg-white p-4">
            <strong className="text-brand-900">Moderação prévia.</strong>{" "}
            Todos os anúncios passam por aprovação antes de ficarem visíveis.
          </li>
        </ul>
      </section>

      <section className="mt-14 rounded-card border border-brand-200 bg-brand-50 p-6">
        <h2 className="font-heading text-lg font-bold">Enquadramento legal</h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-700">
          Declarar os defeitos aumenta a confiança do comprador, mas não substitui nem
          elimina os direitos legais do consumidor. Os bens móveis usados vendidos por um
          profissional a um consumidor têm garantia legal, podendo o prazo de três anos ser
          reduzido para 18 meses mediante acordo entre as partes. Não são permitidas
          expressões que procurem afastar responsabilidade, como &quot;vendido sem
          garantia&quot; ou &quot;não se aceitam reclamações&quot;.
        </p>
        <Link href="/vendedores-profissionais" className="mt-4 inline-block text-sm font-semibold underline">
          Informação completa para vendedores profissionais
        </Link>
      </section>

      <div className="mt-12">
        <Link href="/registar" className="btn-primary px-7 py-3 text-base">
          Registar o meu stand
        </Link>
      </div>
    </div>
  );
}
