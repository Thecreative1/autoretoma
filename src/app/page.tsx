import Link from "next/link";
import type { Metadata } from "next";
import { ListingCard } from "@/components/ListingCard";
import { getRecentListings, getSettings } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Carros baratos, sem surpresas escondidas",
  description:
    "Descobre retomas e carros de baixo valor vendidos diretamente por stands, com os defeitos conhecidos apresentados de forma clara.",
  alternates: { canonical: SITE_URL },
};

const STEPS = [
  {
    n: "1",
    title: "O stand publica",
    text: "Adiciona fotografias, estado do carro e problemas conhecidos.",
  },
  {
    n: "2",
    title: "Tu analisas",
    text: "Vês o que está bem, o que precisa de atenção e os dados da viatura.",
  },
  {
    n: "3",
    title: "Contactas diretamente",
    text: "Falas com o stand responsável e combinas a visita ou negócio.",
  },
];

const TRUST = [
  {
    title: "Sabes sempre quem vende",
    text: "Todos os anúncios identificam o vendedor profissional responsável pela viatura.",
  },
  {
    title: "Os defeitos são declarados",
    text: "Os stands devem declarar os problemas conhecidos, área a área, antes de publicar.",
  },
  {
    title: "As fotografias mostram o estado real",
    text: "Exigimos fotografias do exterior, interior, quadrante, motor e dos defeitos assinalados.",
  },
  {
    title: "Somos a plataforma, não o vendedor",
    text: "A AutoRetoma divulga e liga comprador e stand. O negócio é celebrado diretamente com o stand vendedor.",
  },
];

export default async function HomePage() {
  const [listings, settings] = await Promise.all([getRecentListings(8), getSettings()]);

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-950 text-white">
        <div className="container-site grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-brand-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-400">
              Retomas e carros até {formatPrice(settings.max_price_eur)}
            </p>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Carros baratos, sem surpresas escondidas.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-100">
              Descobre retomas e carros de baixo valor vendidos diretamente por stands,
              com os defeitos conhecidos apresentados de forma clara.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/carros" className="btn-primary px-7 py-3 text-base">
                Ver carros
              </Link>
              <Link
                href="/para-stands"
                className="btn px-7 py-3 text-base border border-brand-700 bg-transparent text-white hover:bg-brand-900"
              >
                Sou um stand
              </Link>
            </div>
            <p className="mt-6 text-sm font-medium text-accent-400">
              Preço baixo não significa informação incompleta.
            </p>
          </div>

          <div className="rounded-card border border-brand-800 bg-brand-900 p-6 lg:p-8">
            <h2 className="font-heading text-lg font-bold">O que vais encontrar aqui</h2>
            <ul className="mt-4 space-y-4 text-sm text-brand-100">
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                <span>Carros recebidos como retoma que os stands não promovem no stock principal.</span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                <span>
                  Viaturas com defeitos estéticos ou mecânicos, descritos com fotografia,
                  gravidade e estimativa de reparação.
                </span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                <span>O estado da viatura dividido por áreas: motor, caixa, travões, pneus, chapa e mais.</span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                <span>Contacto direto com o stand responsável, sem intermediários.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="container-site py-16">
        <h2 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          Como funciona
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500 font-heading text-lg font-bold text-white">
                {step.n}
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Carros recentes */}
      <section className="border-y border-brand-100 bg-white py-16">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
                Carros recentes
              </h2>
              <p className="mt-2 text-brand-600">
                Últimas retomas publicadas pelos stands na plataforma.
              </p>
            </div>
            <Link href="/carros" className="btn-outline">
              Ver todos os carros
            </Link>
          </div>

          {listings.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="mt-8 card p-10 text-center">
              <p className="font-heading text-lg font-bold">Ainda não existem anúncios publicados.</p>
              <p className="mt-2 text-brand-600">
                Assim que os primeiros stands publicarem as suas retomas, aparecem aqui.
              </p>
              <Link href="/registar" className="btn-primary mt-6">
                Registar o meu stand
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Para stands */}
      <section className="container-site py-16">
        <div className="rounded-card bg-brand-900 px-6 py-12 text-white sm:px-12">
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
              Tem retomas paradas no parque?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-brand-100">
              Publique os carros que não quer promover no seu stock principal e encontre
              compradores interessados em veículos de baixo valor.
            </p>
            <Link href="/registar" className="btn-primary mt-8 px-7 py-3 text-base">
              Registar o meu stand
            </Link>
          </div>
        </div>
      </section>

      {/* Confiança */}
      <section className="border-t border-brand-100 bg-white py-16">
        <div className="container-site">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            Porque é que confias no que lês aqui
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {TRUST.map((item) => (
              <div key={item.title} className="card p-6">
                <h3 className="font-heading text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-600">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 rounded-card border border-brand-200 bg-brand-50 p-5 text-sm leading-relaxed text-brand-700">
            A transparência sobre os defeitos não elimina os direitos legais do consumidor.
            Os bens móveis usados vendidos por um profissional a um consumidor têm garantia
            legal, podendo o prazo de três anos ser reduzido para 18 meses mediante acordo
            entre as partes.{" "}
            <Link href="/vendedores-profissionais" className="font-semibold underline">
              Mais sobre vendedores profissionais
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
