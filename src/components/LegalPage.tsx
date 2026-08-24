import Link from "next/link";
import { LEGAL_UPDATED, OPERATOR, OPERATOR_IDENTIFIED, SITE_EMAIL } from "@/lib/constants";

/**
 * Moldura comum às páginas informativas e legais.
 *
 * O texto resume o regime legal português e europeu aplicável e cita a
 * legislação em que se baseia. Não substitui aconselhamento jurídico sobre
 * um caso concreto — é isso que o aviso no topo diz ao leitor.
 */
export function LegalPage({
  title,
  intro,
  notice = true,
  children,
}: {
  title: string;
  intro?: string;
  notice?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="container-site max-w-3xl py-10 lg:py-16">
      <nav aria-label="Caminho" className="mb-5 text-sm text-brand-500">
        <Link href="/" className="hover:text-accent-600">Início</Link>
        <span aria-hidden="true" className="mx-1.5">/</span>
        <span className="text-brand-800">{title}</span>
      </nav>

      <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      {intro && <p className="mt-4 text-lg leading-relaxed text-brand-600">{intro}</p>}

      {notice && (
        <p className="mt-6 rounded-card border-l-4 border-accent-500 bg-accent-50 p-4 text-sm leading-relaxed text-brand-800">
          <strong>Informação geral.</strong> Este documento explica as regras de utilização
          da AutoRetoma e resume direitos e deveres previstos na lei portuguesa e europeia,
          identificando a legislação aplicável. Não substitui aconselhamento jurídico sobre
          um caso concreto.
        </p>
      )}

      <div className="prose-autoretoma mt-8 space-y-6 text-brand-700">{children}</div>

      <div className="mt-10 space-y-2 border-t border-brand-100 pt-6 text-sm text-brand-500">
        {OPERATOR_IDENTIFIED && (
          <p>
            <span className="font-semibold text-brand-700">{OPERATOR.legalName}</span> · NIF{" "}
            {OPERATOR.taxId} · {OPERATOR.address}
          </p>
        )}
        <p>
          Última atualização: {LEGAL_UPDATED}. Para questões sobre este documento, escreva
          para{" "}
          <a href={`mailto:${SITE_EMAIL}`} className="underline">
            {SITE_EMAIL}
          </a>{" "}
          ou utilize a{" "}
          <Link href="/contactos" className="underline">
            página de contactos
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-brand-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

/** Referência a legislação, com ligação ao Diário da República ou ao EUR-Lex. */
export function Lei({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-brand-300 underline-offset-2 hover:text-accent-600"
    >
      {children}
    </a>
  );
}
