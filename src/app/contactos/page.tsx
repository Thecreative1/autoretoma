import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./ContactForm";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contactos",
  description: "Como contactar a equipa da AutoRetoma.",
  alternates: { canonical: `${SITE_URL}/contactos` },
};

export default function ContactsPage() {
  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? null;

  return (
    <div className="container-site max-w-3xl py-10 lg:py-16">
      <nav aria-label="Caminho" className="mb-5 text-sm text-brand-500">
        <Link href="/" className="hover:text-accent-600">Início</Link>
        <span aria-hidden="true" className="mx-1.5">/</span>
        <span className="text-brand-800">Contactos</span>
      </nav>

      <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
        Contactos
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-brand-600">
        Para questões sobre a plataforma, registo de stands, moderação de anúncios ou
        proteção de dados.
      </p>

      <div className="mt-8 rounded-card border border-brand-200 bg-brand-50 p-5 text-sm leading-relaxed text-brand-700">
        <p>
          <strong className="text-brand-900">Quer falar sobre um carro específico?</strong>{" "}
          Os pedidos sobre viaturas devem ser feitos diretamente ao stand vendedor, através
          do botão de contacto na página do anúncio. A AutoRetoma não intervém na
          negociação nem na venda.
        </p>
      </div>

      <div className="card mt-8 p-6">
        <h2 className="mb-5 font-heading text-lg font-bold">Enviar mensagem</h2>
        <ContactForm formspreeId={formspreeId} />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-heading text-base font-bold">Email</h2>
          <p className="mt-2 text-sm text-brand-600">
            Se preferir escrever diretamente.
          </p>
          <a href="mailto:contacto@autoretoma.pt" className="btn-outline mt-4">
            contacto@autoretoma.pt
          </a>
        </div>

        <div className="card p-6">
          <h2 className="font-heading text-base font-bold">Reclamações</h2>
          <p className="mt-2 text-sm text-brand-600">
            Livro de Reclamações eletrónico e resolução de litígios.
          </p>
          <Link href="/livro-de-reclamacoes" className="btn-outline mt-4">
            Ver informação
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-card border border-brand-200 p-5 text-sm text-brand-600">
        <p>
          Os dados completos de identificação da entidade que explora a AutoRetoma
          (denominação social, NIF e sede) serão publicados nesta página antes do
          lançamento público, conforme exigido pela legislação aplicável ao comércio
          eletrónico.
        </p>
      </div>
    </div>
  );
}
