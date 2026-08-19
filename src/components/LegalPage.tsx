import Link from "next/link";

/**
 * Moldura comum às páginas informativas e legais.
 * Todo o conteúdo jurídico é provisório e deve ser revisto por
 * advogado português antes do lançamento.
 */
export function LegalPage({
  title,
  intro,
  provisional = true,
  children,
}: {
  title: string;
  intro?: string;
  provisional?: boolean;
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

      {provisional && (
        <p className="mt-6 rounded-card border-l-4 border-accent-500 bg-accent-50 p-4 text-sm leading-relaxed text-brand-800">
          <strong>Documento provisório.</strong> Este texto foi preparado para a fase de
          MVP e destina-se a ser revisto e validado por advogado inscrito na Ordem dos
          Advogados portuguesa antes do lançamento público da plataforma.
        </p>
      )}

      <div className="prose-autoretoma mt-8 space-y-6 text-brand-700">{children}</div>

      <p className="mt-10 border-t border-brand-100 pt-6 text-sm text-brand-500">
        Última atualização: versão inicial do MVP. Para questões sobre este documento,
        utilize a{" "}
        <Link href="/contactos" className="underline">
          página de contactos
        </Link>
        .
      </p>
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
