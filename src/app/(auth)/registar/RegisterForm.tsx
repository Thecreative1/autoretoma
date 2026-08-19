"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registerStand, type AuthState } from "../actions";
import { DISTRICTS } from "@/lib/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "A registar…" : "Submeter registo"}
    </button>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-brand-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(registerStand, { ok: false });
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </p>
      )}

      <fieldset className="space-y-5">
        <legend className="font-heading text-base font-bold text-brand-900">
          Dados do stand
        </legend>

        <Field id="commercial_name" label="Nome comercial *" error={e.commercial_name}>
          <input id="commercial_name" name="commercial_name" type="text" required maxLength={120} className="input" />
        </Field>

        <Field id="company_name" label="Nome da empresa *" error={e.company_name}>
          <input id="company_name" name="company_name" type="text" required maxLength={160} className="input" />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="nif" label="NIF *" error={e.nif} hint="9 dígitos">
            <input id="nif" name="nif" type="text" required inputMode="numeric" pattern="[0-9]{9}" maxLength={9} className="input" />
          </Field>

          <Field
            id="activity_id"
            label="Identificação de atividade"
            error={e.activity_id}
            hint="Alvará ou registo profissional, quando aplicável"
          >
            <input id="activity_id" name="activity_id" type="text" maxLength={60} className="input" />
          </Field>
        </div>

        <Field id="address" label="Morada *" error={e.address}>
          <input id="address" name="address" type="text" required maxLength={240} className="input" autoComplete="street-address" />
        </Field>

        <Field id="district" label="Distrito *" error={e.district}>
          <select id="district" name="district" required defaultValue="" className="input">
            <option value="" disabled>Escolha o distrito</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>

        <Field id="website" label="Website" error={e.website} hint="Inclua https://">
          <input id="website" name="website" type="url" maxLength={200} className="input" placeholder="https://" />
        </Field>
      </fieldset>

      <fieldset className="space-y-5 border-t border-brand-100 pt-5">
        <legend className="font-heading text-base font-bold text-brand-900">
          Responsável e contactos
        </legend>

        <Field id="contact_name" label="Nome do responsável *" error={e.contact_name}>
          <input id="contact_name" name="contact_name" type="text" required maxLength={120} className="input" autoComplete="name" />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="phone" label="Telefone *" error={e.phone}>
            <input id="phone" name="phone" type="tel" required className="input" autoComplete="tel" />
          </Field>

          <Field id="whatsapp" label="WhatsApp" error={e.whatsapp}>
            <input id="whatsapp" name="whatsapp" type="tel" className="input" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-brand-100 pt-5">
        <legend className="font-heading text-base font-bold text-brand-900">
          Dados de acesso
        </legend>

        <Field id="email" label="Email *" error={e.email} hint="Será usado para iniciar sessão">
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </Field>

        <Field id="password" label="Palavra-passe *" error={e.password} hint="Mínimo de 8 caracteres">
          <input id="password" name="password" type="password" required minLength={8} className="input" autoComplete="new-password" />
        </Field>
      </fieldset>

      <div className="border-t border-brand-100 pt-5">
        <label className="flex items-start gap-2.5 text-sm leading-relaxed text-brand-700">
          <input
            type="checkbox" name="terms" required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-300 text-accent-500 focus:ring-accent-500"
          />
          <span>
            Confirmo que represento um vendedor profissional e aceito os{" "}
            <Link href="/termos-e-condicoes" className="underline" target="_blank">
              termos e condições
            </Link>{" "}
            e a{" "}
            <Link href="/politica-de-privacidade" className="underline" target="_blank">
              política de privacidade
            </Link>
            . *
          </span>
        </label>
        {e.terms && <p className="mt-1 text-xs text-red-700">{e.terms}</p>}
      </div>

      <SubmitButton />

      <p className="text-xs leading-relaxed text-brand-500">
        Os dados submetidos destinam-se à verificação do stand e à gestão da conta.
        Após o registo, a conta fica a aguardar verificação antes de poder publicar anúncios.
      </p>
    </form>
  );
}
