"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveStep1, type ActionState } from "@/app/painel/anuncios/actions";
import { FUEL_LABELS, GEARBOX_LABELS } from "@/lib/constants";
import type { Brand, Listing, Model } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "A guardar…" : label}
    </button>
  );
}

export function Step1Form({
  brands,
  models,
  listing,
}: {
  brands: Brand[];
  models: Model[];
  listing?: Listing;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveStep1, { ok: false });
  const [brandId, setBrandId] = useState(listing?.brand_id ?? "");
  const e = state.errors ?? {};
  const currentYear = new Date().getFullYear();
  const availableModels = models.filter((m) => m.brand_id === brandId);

  return (
    <form action={formAction} className="space-y-5">
      {listing && <input type="hidden" name="listing_id" value={listing.id} />}

      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="brand_id" className="label">Marca *</label>
          <select
            id="brand_id" name="brand_id" required className="input"
            value={brandId} onChange={(ev) => setBrandId(ev.target.value)}
          >
            <option value="" disabled>Escolha a marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {e.brand_id && <p className="mt-1 text-xs text-red-700">{e.brand_id}</p>}
        </div>

        <div>
          <label htmlFor="model_id" className="label">Modelo *</label>
          <select
            id="model_id" name="model_id" required className="input"
            defaultValue={listing?.model_id ?? ""} disabled={!brandId}
          >
            <option value="" disabled>
              {brandId ? "Escolha o modelo" : "Escolha primeiro a marca"}
            </option>
            {availableModels.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {e.model_id && <p className="mt-1 text-xs text-red-700">{e.model_id}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="version" className="label">Versão</label>
        <input
          id="version" name="version" type="text" maxLength={120} className="input"
          defaultValue={listing?.version ?? ""} placeholder="Ex.: 1.2 Twinport Enjoy"
        />
        {e.version && <p className="mt-1 text-xs text-red-700">{e.version}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="year" className="label">Ano *</label>
          <input
            id="year" name="year" type="number" required min={1950} max={currentYear + 1}
            className="input" defaultValue={listing?.year ?? ""}
          />
          {e.year && <p className="mt-1 text-xs text-red-700">{e.year}</p>}
        </div>

        <div>
          <label htmlFor="month" className="label">Mês</label>
          <select id="month" name="month" className="input" defaultValue={listing?.month ?? ""}>
            <option value="">—</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
            ))}
          </select>
          {e.month && <p className="mt-1 text-xs text-red-700">{e.month}</p>}
        </div>

        <div>
          <label htmlFor="mileage" className="label">Quilómetros *</label>
          <input
            id="mileage" name="mileage" type="number" required min={0} max={2000000}
            className="input" defaultValue={listing?.mileage ?? ""}
          />
          {e.mileage && <p className="mt-1 text-xs text-red-700">{e.mileage}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fuel" className="label">Combustível *</label>
          <select id="fuel" name="fuel" required className="input" defaultValue={listing?.fuel ?? ""}>
            <option value="" disabled>Escolha o combustível</option>
            {Object.entries(FUEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {e.fuel && <p className="mt-1 text-xs text-red-700">{e.fuel}</p>}
        </div>

        <div>
          <label htmlFor="gearbox" className="label">Caixa *</label>
          <select id="gearbox" name="gearbox" required className="input" defaultValue={listing?.gearbox ?? ""}>
            <option value="" disabled>Escolha o tipo de caixa</option>
            {Object.entries(GEARBOX_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {e.gearbox && <p className="mt-1 text-xs text-red-700">{e.gearbox}</p>}
        </div>
      </div>

      <div className="flex justify-end border-t border-brand-100 pt-5">
        <SubmitButton label={listing ? "Guardar e continuar" : "Criar rascunho e continuar"} />
      </div>
    </form>
  );
}
