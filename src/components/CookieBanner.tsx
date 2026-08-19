"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "autoretoma:cookies";

/**
 * Aviso de cookies. O MVP não usa cookies de análise nem publicidade:
 * apenas os cookies essenciais de sessão. A escolha fica guardada
 * localmente para não repetir o aviso.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage indisponível (modo privado) — não mostrar o aviso.
    }
  }, []);

  function dismiss(choice: "essenciais" | "todos") {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Ignorado: sem armazenamento, o aviso volta a aparecer.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-200 bg-white p-4 shadow-lg"
    >
      <div className="container-site flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-700">
          Utilizamos apenas cookies essenciais ao funcionamento do site (sessão e
          segurança). Saiba mais na{" "}
          <Link href="/politica-de-cookies" className="font-semibold underline">
            política de cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => dismiss("essenciais")} className="btn-outline">
            Apenas essenciais
          </button>
          <button type="button" onClick={() => dismiss("todos")} className="btn-primary">
            Compreendi
          </button>
        </div>
      </div>
    </div>
  );
}
