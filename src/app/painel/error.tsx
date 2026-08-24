"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Rede de segurança do painel: qualquer erro não tratado — incluindo os que
 * vêm de server actions — para aqui em vez de mostrar o ecrã genérico do Next.
 * O erro real fica no registo do servidor; o stand vê uma explicação em português.
 */
export default function PainelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("painel:", error.message, error.digest);
  }, [error]);

  return (
    <div className="container-site max-w-lg py-16 text-center">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight">
        Não foi possível concluir a operação
      </h1>
      <p className="mt-3 text-brand-600">
        Ocorreu um problema inesperado. Os seus dados não se perderam — tente novamente
        dentro de momentos.
      </p>
      <p className="mt-3 text-sm text-brand-500">
        Se continuar a acontecer, escreva para{" "}
        <a href="mailto:contacto@autoretoma.pt" className="font-semibold underline">
          contacto@autoretoma.pt
        </a>{" "}
        e descreva o que estava a fazer.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-primary">
          Tentar novamente
        </button>
        <Link href="/painel" className="btn-outline">
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
