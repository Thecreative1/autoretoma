"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateSettings, type AdminState } from "../actions";
import type { PlatformSettings } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "A guardar…" : "Guardar definições"}
    </button>
  );
}

export function SettingsForm({ settings }: { settings: PlatformSettings }) {
  const [state, formAction] = useActionState<AdminState, FormData>(updateSettings, { ok: false });

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <p
          role="status"
          className={`rounded-lg p-3 text-sm ${
            state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="max_price_eur" className="label">Preço máximo por anúncio (€)</label>
        <input
          id="max_price_eur" name="max_price_eur" type="number" required min={1} step={100}
          className="input sm:max-w-xs" defaultValue={settings.max_price_eur}
        />
        <p className="mt-1 text-xs text-brand-500">
          Limite aplicado na submissão de anúncios e apresentado nos filtros de pesquisa.
          O valor predefinido é 5.000 €.
        </p>
      </div>

      <div>
        <label htmlFor="min_photos" className="label">Mínimo de fotografias por anúncio</label>
        <input
          id="min_photos" name="min_photos" type="number" required min={1} max={30}
          className="input sm:max-w-xs" defaultValue={settings.min_photos}
        />
        <p className="mt-1 text-xs text-brand-500">
          Além deste mínimo, são sempre exigidas as sete categorias obrigatórias
          (frontal, traseira, laterais, interior, quadrante e motor).
        </p>
      </div>

      <div>
        <label htmlFor="facet_min_listings" className="label">
          Mínimo de anúncios para páginas por marca, distrito e combustível
        </label>
        <input
          id="facet_min_listings" name="facet_min_listings" type="number" required min={1} max={100}
          className="input sm:max-w-xs" defaultValue={settings.facet_min_listings}
        />
        <p className="mt-1 text-xs text-brand-500">
          As páginas por marca, distrito e combustível só são criadas — e mostradas ao
          Google — quando existirem, pelo menos, este número de anúncios.
        </p>
      </div>

      <div className="border-t border-brand-100 pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}
