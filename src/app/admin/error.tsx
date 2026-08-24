"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Equivalente ao do painel, para a área de administração. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("admin:", error.message, error.digest);
  }, [error]);

  return (
    <div className="container-site max-w-lg py-16 text-center">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight">
        Não foi possível concluir a operação
      </h1>
      <p className="mt-3 text-brand-600">
        Ocorreu um problema inesperado. O detalhe técnico ficou no registo do servidor.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-primary">
          Tentar novamente
        </button>
        <Link href="/admin" className="btn-outline">
          Voltar à administração
        </Link>
      </div>
    </div>
  );
}
