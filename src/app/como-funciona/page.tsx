import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/constants";
import { CONDITION_AREAS, CONDITION_STATUS_META } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Como funciona",
  description:
    "Como funciona a AutoRetoma: o stand publica com os defeitos declarados, tu analisas o estado da viatura e contactas diretamente o vendedor profissional.",
  alternates: { canonical: `${SITE_URL}/como-funciona` },
};

const STEPS = [
  {
    n: "1",
    title: "O stand publica",
    text: "O vendedor profissional cria o anúncio com fotografias obrigatórias do exterior, interior, quadrante e motor, indica o estado de cada área da viatura e declara os problemas conhecidos.",
  },
  {
    n: "2",
    title: "A AutoRetoma modera",
    text: "Nenhum anúncio é publicado automaticamente. Verificamos se as fotografias e a informação sobre o estado cumprem as regras antes de o anúncio ficar visível.",
  },
  {
    n: "3",
    title: "Tu analisas",
    text: "Vês o que está bem, o que precisa de atenção, a gravidade de cada problema, a estimativa de reparação indicada pelo stand e se o carro circula.",
  },
  {
    n: "4",
    title: "Contactas diretamente",
    text: "Falas com o stand responsável por telefone, WhatsApp, email ou formulário e combinas a visita ou o negócio. A venda é feita diretamente com o stand.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container-site max-w-4xl py-10 lg:py-16">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
        Como funciona
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-brand-600">
        A AutoRetoma é um marketplace de retomas e carros usados de baixo valor vendidos
        por stands portugueses. A diferença está na informação: o estado da viatura é
        apresentado antes de perderes tempo com deslocações.
      </p>

      <ol className="mt-10 space-y-5">
        {STEPS.map((step) => (
          <li key={step.n} className="card flex gap-5 p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500 font-heading text-lg font-bold text-white">
              {step.n}
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-600">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">
          As áreas avaliadas em cada anúncio
        </h2>
        <p className="mt-3 text-brand-600">
          Cada anúncio classifica estas nove áreas da viatura. Nada fica escondido em
          separadores fechados.
        </p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-3">
          {CONDITION_AREAS.map((area) => (
            <li key={area.value} className="rounded-lg border border-brand-100 bg-white px-4 py-3 text-sm font-medium">
              {area.label}
            </li>
          ))}
        </ul>

        <h3 className="mt-8 font-heading text-lg font-bold">Estados possíveis</h3>
        <ul className="mt-4 space-y-2">
          {Object.entries(CONDITION_STATUS_META).map(([key, meta]) => (
            <li key={key} className="flex items-center gap-3 rounded-lg border border-brand-100 bg-white px-4 py-3">
              <span className={`badge ${meta.badge}`}>
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 rounded-card bg-brand-900 p-8 text-white">
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">
          O que a AutoRetoma é — e o que não é
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="font-heading text-base font-bold text-accent-400">É</h3>
            <ul className="mt-2 space-y-2 text-sm text-brand-100">
              <li>Uma plataforma de divulgação e contacto entre compradores e stands.</li>
              <li>Um espaço onde os defeitos conhecidos são declarados antes do contacto.</li>
              <li>Um canal para carros que os stands não promovem no stock principal.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-accent-400">Não é</h3>
            <ul className="mt-2 space-y-2 text-sm text-brand-100">
              <li>Proprietária nem vendedora dos veículos anunciados.</li>
              <li>Um leilão nem um sistema de compra online.</li>
              <li>Um espaço para anúncios de particulares — apenas vendedores profissionais.</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link href="/carros" className="btn-primary px-7 py-3 text-base">Ver carros</Link>
        <Link href="/para-stands" className="btn-outline px-7 py-3 text-base">Sou um stand</Link>
      </div>
    </div>
  );
}
