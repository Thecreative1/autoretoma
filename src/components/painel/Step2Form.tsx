"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { saveStep2, type ActionState } from "@/app/painel/anuncios/actions";
import type { Listing } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "A guardar…" : "Guardar e continuar"}
    </button>
  );
}

export function Step2Form({ listing }: { listing: Listing }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveStep2, { ok: false });
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="listing_id" value={listing.id} />

      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="displacement_cc" className="label">Cilindrada (cm³)</label>
          <input
            id="displacement_cc" name="displacement_cc" type="number" min={1} max={10000}
            className="input" defaultValue={listing.displacement_cc ?? ""}
          />
          {e.displacement_cc && <p className="mt-1 text-xs text-red-700">{e.displacement_cc}</p>}
        </div>

        <div>
          <label htmlFor="power_hp" className="label">Potência (cv)</label>
          <input
            id="power_hp" name="power_hp" type="number" min={1} max={2000}
            className="input" defaultValue={listing.power_hp ?? ""}
          />
          {e.power_hp && <p className="mt-1 text-xs text-red-700">{e.power_hp}</p>}
        </div>

        <div>
          <label htmlFor="doors" className="label">Número de portas</label>
          <select id="doors" name="doors" className="input" defaultValue={listing.doors ?? ""}>
            <option value="">—</option>
            {[2, 3, 4, 5, 6].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {e.doors && <p className="mt-1 text-xs text-red-700">{e.doors}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="keys_count" className="label">Número de chaves</label>
          <select id="keys_count" name="keys_count" className="input" defaultValue={listing.keys_count ?? ""}>
            <option value="">—</option>
            {[0, 1, 2, 3, 4].map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          {e.keys_count && <p className="mt-1 text-xs text-red-700">{e.keys_count}</p>}
        </div>

        <div>
          <label htmlFor="owners_count" className="label">Nº de proprietários</label>
          <input
            id="owners_count" name="owners_count" type="number" min={1} max={99}
            className="input" defaultValue={listing.owners_count ?? ""}
            placeholder="Se conhecido"
          />
          {e.owners_count && <p className="mt-1 text-xs text-red-700">{e.owners_count}</p>}
        </div>

        <div>
          <label htmlFor="inspection_valid_until" className="label">Inspeção válida até</label>
          <input
            id="inspection_valid_until" name="inspection_valid_until" type="date"
            className="input" defaultValue={listing.inspection_valid_until ?? ""}
          />
          {e.inspection_valid_until && (
            <p className="mt-1 text-xs text-red-700">{e.inspection_valid_until}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="maintenance_history" className="label">
          Histórico de manutenção conhecido
        </label>
        <textarea
          id="maintenance_history" name="maintenance_history" rows={4} maxLength={2000}
          className="input" defaultValue={listing.maintenance_history ?? ""}
          placeholder="Ex.: Correia de distribuição substituída aos 190.000 km, com fatura. Revisões regulares desde 2015."
        />
        <p className="mt-1 text-xs text-brand-500">
          Indique o que sabe. Se não houver histórico documentado, escreva-o também —
          é informação útil para o comprador.
        </p>
        {e.maintenance_history && (
          <p className="mt-1 text-xs text-red-700">{e.maintenance_history}</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-brand-100 pt-5">
        <Link href={`/painel/anuncios/${listing.id}?passo=1`} className="btn-outline">
          Voltar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
