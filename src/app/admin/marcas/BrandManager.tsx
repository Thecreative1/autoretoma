"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createBrand, createModel, deleteModel, type AdminState } from "../actions";
import type { Brand } from "@/lib/types";

interface BrandRow extends Brand {
  models: { id: string; name: string; slug: string }[];
  listings: { id: string }[];
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary shrink-0" disabled={pending}>
      {pending ? "A guardar…" : label}
    </button>
  );
}

function Feedback({ state }: { state: AdminState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={`mt-2 rounded-lg p-2.5 text-sm ${
        state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
      }`}
    >
      {state.message}
    </p>
  );
}

export function BrandManager({
  brands,
  usedModelIds,
}: {
  brands: BrandRow[];
  usedModelIds: string[];
}) {
  const [brandState, brandAction] = useActionState<AdminState, FormData>(createBrand, { ok: false });
  const [modelState, modelAction] = useActionState<AdminState, FormData>(createModel, { ok: false });
  const [expanded, setExpanded] = useState<string | null>(null);
  const used = new Set(usedModelIds);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="font-heading text-base font-bold">Adicionar marca</h3>
          <form action={brandAction} className="mt-3 flex gap-2">
            <label htmlFor="brand-name" className="sr-only">Nome da marca</label>
            <input
              id="brand-name" name="name" type="text" required maxLength={60}
              className="input" placeholder="Ex.: Lancia"
            />
            <SubmitButton label="Adicionar" />
          </form>
          <Feedback state={brandState} />
        </section>

        <section className="card p-5">
          <h3 className="font-heading text-base font-bold">Adicionar modelo</h3>
          <form action={modelAction} className="mt-3 space-y-2">
            <label htmlFor="model-brand" className="sr-only">Marca</label>
            <select id="model-brand" name="brand_id" required className="input" defaultValue="">
              <option value="" disabled>Escolha a marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <label htmlFor="model-name" className="sr-only">Nome do modelo</label>
              <input
                id="model-name" name="name" type="text" required maxLength={60}
                className="input" placeholder="Ex.: Ypsilon"
              />
              <SubmitButton label="Adicionar" />
            </div>
          </form>
          <Feedback state={modelState} />
        </section>
      </div>

      <section className="card p-5">
        <h3 className="font-heading text-base font-bold">
          {brands.length} marcas registadas
        </h3>
        <ul className="mt-4 divide-y divide-brand-100">
          {brands.map((brand) => {
            const open = expanded === brand.id;
            return (
              <li key={brand.id} className="py-3">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : brand.id)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <span>
                    <span className="font-semibold text-brand-900">{brand.name}</span>
                    <span className="ml-2 text-xs text-brand-500">
                      {brand.models.length} modelos · {brand.listings.length} anúncios
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {open && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {brand.models.length === 0 && (
                      <li className="text-sm text-brand-500">Sem modelos registados.</li>
                    )}
                    {brand.models.map((model) => (
                      <li
                        key={model.id}
                        className="flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm"
                      >
                        <span>{model.name}</span>
                        {used.has(model.id) ? (
                          <span className="text-xs text-brand-400">em uso</span>
                        ) : (
                          <form action={deleteModel}>
                            <input type="hidden" name="model_id" value={model.id} />
                            <button
                              type="submit"
                              className="text-xs font-semibold text-red-700 hover:text-red-800"
                              aria-label={`Remover modelo ${model.name}`}
                            >
                              remover
                            </button>
                          </form>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
