"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateStand, type StandState } from "./actions";
import { DISTRICTS } from "@/lib/constants";
import type { Stand } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "A guardar…" : "Guardar alterações"}
    </button>
  );
}

export function StandForm({ stand }: { stand: Stand }) {
  const [state, formAction] = useActionState<StandState, FormData>(updateStand, { ok: false });
  const e = state.errors ?? {};

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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="commercial_name" className="label">Nome comercial *</label>
          <input
            id="commercial_name" name="commercial_name" type="text" required maxLength={120}
            className="input" defaultValue={stand.commercial_name}
          />
          {e.commercial_name && <p className="mt-1 text-xs text-red-700">{e.commercial_name}</p>}
        </div>

        <div>
          <label htmlFor="company_name" className="label">Nome da empresa *</label>
          <input
            id="company_name" name="company_name" type="text" required maxLength={160}
            className="input" defaultValue={stand.company_name}
          />
          {e.company_name && <p className="mt-1 text-xs text-red-700">{e.company_name}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="contact_name" className="label">Nome do responsável *</label>
        <input
          id="contact_name" name="contact_name" type="text" required maxLength={120}
          className="input" defaultValue={stand.contact_name}
        />
        {e.contact_name && <p className="mt-1 text-xs text-red-700">{e.contact_name}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="label">Telefone *</label>
          <input
            id="phone" name="phone" type="tel" required className="input" defaultValue={stand.phone}
          />
          {e.phone && <p className="mt-1 text-xs text-red-700">{e.phone}</p>}
        </div>

        <div>
          <label htmlFor="whatsapp" className="label">WhatsApp</label>
          <input
            id="whatsapp" name="whatsapp" type="tel" className="input"
            defaultValue={stand.whatsapp ?? ""}
          />
          {e.whatsapp && <p className="mt-1 text-xs text-red-700">{e.whatsapp}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="address" className="label">Morada *</label>
        <input
          id="address" name="address" type="text" required maxLength={240}
          className="input" defaultValue={stand.address}
        />
        {e.address && <p className="mt-1 text-xs text-red-700">{e.address}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="district" className="label">Distrito *</label>
          <select id="district" name="district" required className="input" defaultValue={stand.district}>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {e.district && <p className="mt-1 text-xs text-red-700">{e.district}</p>}
        </div>

        <div>
          <label htmlFor="activity_id" className="label">Identificação de atividade</label>
          <input
            id="activity_id" name="activity_id" type="text" maxLength={60}
            className="input" defaultValue={stand.activity_id ?? ""}
          />
          {e.activity_id && <p className="mt-1 text-xs text-red-700">{e.activity_id}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="website" className="label">Website</label>
        <input
          id="website" name="website" type="url" maxLength={200} className="input"
          defaultValue={stand.website ?? ""} placeholder="https://"
        />
        {e.website && <p className="mt-1 text-xs text-red-700">{e.website}</p>}
      </div>

      <div className="border-t border-brand-100 pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}
