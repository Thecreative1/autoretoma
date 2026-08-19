"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { saveStep5, type ActionState } from "@/app/painel/anuncios/actions";
import { DISTRICTS } from "@/lib/constants";
import type { Listing } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "A guardar…" : "Guardar e continuar"}
    </button>
  );
}

export function Step5Form({
  listing,
  maxPrice,
  standDistrict,
}: {
  listing: Listing;
  maxPrice: number;
  standDistrict: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveStep5, { ok: false });
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="listing_id" value={listing.id} />

      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="price" className="label">Preço (€) *</label>
        <input
          id="price" name="price" type="number" required min={1} max={maxPrice}
          className="input sm:max-w-xs" defaultValue={listing.price ?? ""}
        />
        <p className="mt-1 text-xs text-brand-500">
          Limite atual da plataforma: {maxPrice.toLocaleString("pt-PT")} €
        </p>
        {e.price && <p className="mt-1 text-xs text-red-700">{e.price}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="district" className="label">Distrito *</label>
          <select
            id="district" name="district" required className="input"
            defaultValue={listing.district ?? standDistrict}
          >
            <option value="" disabled>Escolha o distrito</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {e.district && <p className="mt-1 text-xs text-red-700">{e.district}</p>}
        </div>

        <div>
          <label htmlFor="municipality" className="label">Concelho</label>
          <input
            id="municipality" name="municipality" type="text" maxLength={80}
            className="input" defaultValue={listing.municipality ?? ""}
            placeholder="Ex.: Guimarães"
          />
          <p className="mt-1 text-xs text-brand-500">Usado no endereço do anúncio.</p>
          {e.municipality && <p className="mt-1 text-xs text-red-700">{e.municipality}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="label">Descrição do anúncio</label>
        <textarea
          id="description" name="description" rows={6} maxLength={4000}
          className="input" defaultValue={listing.description ?? ""}
          placeholder="Descreva o carro com honestidade: para que serve, em que estado está e o que o comprador deve esperar."
        />
        {e.description && <p className="mt-1 text-xs text-red-700">{e.description}</p>}
        <div className="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          <strong>Expressões não permitidas:</strong> &quot;sem garantia&quot;, &quot;não se
          aceitam reclamações&quot;, &quot;vendido como está e sem qualquer
          responsabilidade&quot; ou &quot;o comprador renuncia aos seus direitos&quot;.
          Os bens usados vendidos por profissionais a consumidores têm garantia legal.
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-brand-100 pt-5">
        <Link href={`/painel/anuncios/${listing.id}?passo=4`} className="btn-outline">
          Voltar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
