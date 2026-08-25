"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteStand } from "../actions";

export function DeleteStand({
  standId,
  commercialName,
  listingCount,
  leadCount,
}: {
  standId: string;
  commercialName: string;
  listingCount: number;
  leadCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function confirmDelete() {
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set("stand_id", standId);
    const result = await deleteStand(fd);
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? "Não foi possível remover o stand.");
      return;
    }
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-danger px-4 py-2 text-xs"
      >
        Remover stand
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`remover-titulo-${standId}`}
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) setOpen(false);
          }}
        >
          <div className="card w-full max-w-md p-6 text-left">
            <h3
              id={`remover-titulo-${standId}`}
              className="font-heading text-lg font-extrabold text-brand-900"
            >
              Remover {commercialName}?
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-brand-700">
              Apaga a conta de acesso, {listingCount} anúncio(s) com as respetivas
              fotografias, o estado declarado e os defeitos, e {leadCount} pedido(s) de
              contacto — que incluem nomes, emails e telefones de compradores.
            </p>
            <p className="mt-2 text-sm font-semibold text-red-800">
              Não há forma de recuperar. O stand fica suspenso e fora de circulação mesmo
              que não o remova.
            </p>

            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="btn-outline px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={busy}
                className="btn-danger px-4 py-2 text-sm"
              >
                {busy ? "A remover…" : "Sim, remover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
