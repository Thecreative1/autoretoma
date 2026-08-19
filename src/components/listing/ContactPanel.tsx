"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { submitLead, type LeadState } from "@/app/carros/[slug]/actions";
import type { ListingWithRelations } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "A enviar…" : "Enviar pedido"}
    </button>
  );
}

export function ContactPanel({
  listing,
  title,
}: {
  listing: ListingWithRelations;
  title: string;
}) {
  const [state, formAction] = useActionState<LeadState, FormData>(submitLead, { ok: false });
  const [formOpen, setFormOpen] = useState(false);
  const stand = listing.stand;

  const whatsappHref = stand.whatsapp
    ? `https://wa.me/351${stand.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Olá, vi o anúncio do ${title} na AutoRetoma e gostava de mais informações.`
      )}`
    : null;

  return (
    <section aria-labelledby="contacto-stand" className="card p-6">
      <h2 id="contacto-stand" className="font-heading text-xl font-extrabold">
        Contactar o stand
      </h2>

      <div className="mt-4 rounded-lg bg-brand-50 p-4">
        <p className="font-heading text-base font-bold text-brand-900">
          {stand.commercial_name}
          {stand.is_demo && (
            <span className="badge ml-2 bg-brand-200 text-brand-700">Demonstração</span>
          )}
        </p>
        <p className="mt-1 text-sm text-brand-600">
          {stand.address}, {stand.district}
        </p>
        <p className="mt-2 text-xs text-brand-500">
          Vendedor profissional responsável por esta viatura.
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <a href={`tel:${stand.phone.replace(/\s/g, "")}`} className="btn-secondary w-full">
          Contactar o stand · {stand.phone}
        </a>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full"
          >
            WhatsApp
          </a>
        )}
        <a href={`mailto:${stand.email}`} className="btn-outline w-full">
          Enviar email
        </a>
        {!formOpen && !state.ok && (
          <button type="button" onClick={() => setFormOpen(true)} className="btn-primary w-full">
            Pedir mais informações
          </button>
        )}
      </div>

      {state.ok ? (
        <p role="status" className="mt-4 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-800">
          {state.message}
        </p>
      ) : (
        formOpen && (
          <form action={formAction} className="mt-6 space-y-4 border-t border-brand-100 pt-6">
            <input type="hidden" name="listing_id" value={listing.id} />

            {/* Honeypot anti-spam — invisível para pessoas */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Não preencher</label>
              <input id="website" type="text" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            {state.message && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {state.message}
              </p>
            )}

            <div>
              <label htmlFor="lead-name" className="label">Nome *</label>
              <input
                id="lead-name" name="name" type="text" required maxLength={120}
                className="input" autoComplete="name"
                aria-invalid={!!state.errors?.name}
              />
              {state.errors?.name && (
                <p className="mt-1 text-xs text-red-700">{state.errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="lead-email" className="label">Email *</label>
              <input
                id="lead-email" name="email" type="email" required
                className="input" autoComplete="email"
                aria-invalid={!!state.errors?.email}
              />
              {state.errors?.email && (
                <p className="mt-1 text-xs text-red-700">{state.errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="lead-phone" className="label">Telefone</label>
              <input
                id="lead-phone" name="phone" type="tel"
                className="input" autoComplete="tel"
                aria-invalid={!!state.errors?.phone}
              />
              {state.errors?.phone && (
                <p className="mt-1 text-xs text-red-700">{state.errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="lead-message" className="label">Mensagem *</label>
              <textarea
                id="lead-message" name="message" rows={4} required maxLength={2000}
                className="input"
                defaultValue={`Olá, tenho interesse no ${title}. Ainda está disponível?`}
                aria-invalid={!!state.errors?.message}
              />
              {state.errors?.message && (
                <p className="mt-1 text-xs text-red-700">{state.errors.message}</p>
              )}
            </div>

            <label className="flex items-start gap-2.5 text-xs leading-relaxed text-brand-600">
              <input
                type="checkbox" name="rgpd_consent" required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-300 text-accent-500 focus:ring-accent-500"
              />
              <span>
                Autorizo que os meus dados sejam transmitidos ao stand vendedor para efeitos
                de resposta a este pedido, nos termos da{" "}
                <Link href="/politica-de-privacidade" className="underline">
                  política de privacidade
                </Link>
                . *
              </span>
            </label>
            {state.errors?.rgpd_consent && (
              <p className="text-xs text-red-700">{state.errors.rgpd_consent}</p>
            )}

            <SubmitButton />

            <p className="text-xs leading-relaxed text-brand-500">
              O seu pedido é enviado ao stand responsável pelo anúncio. A AutoRetoma não
              intervém na negociação nem na venda.
            </p>
          </form>
        )
      )}
    </section>
  );
}
