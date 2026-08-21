"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Formulário de contacto da plataforma (mensagens para a equipa AutoRetoma).
 * Enviado via Formspree enquanto não existir email próprio no domínio.
 *
 * Não confundir com o pedido de contacto de um anúncio: esse é gravado na
 * base de dados e chega ao painel do stand (ver ContactPanel).
 */
export function ContactForm({ formspreeId }: { formspreeId: string | null }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  if (!formspreeId) {
    return (
      <div className="rounded-card border border-brand-200 bg-brand-50 p-5 text-sm leading-relaxed text-brand-700">
        <p>
          O formulário de contacto está a ser configurado. Entretanto, escreva para{" "}
          <a href="mailto:contacto@autoretoma.pt" className="font-semibold underline">
            contacto@autoretoma.pt
          </a>
          .
        </p>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: só bots preenchem este campo.
    if (String(data.get("website") ?? "")) {
      setStatus("sent");
      return;
    }

    setStatus("sending");
    setError(null);

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setStatus("sent");
        form.reset();
        return;
      }

      const body = await response.json().catch(() => null);
      setError(
        body?.errors?.[0]?.message ??
          "Não foi possível enviar a mensagem. Tente novamente ou escreva para contacto@autoretoma.pt."
      );
      setStatus("error");
    } catch {
      setError(
        "Não foi possível contactar o servidor. Verifique a ligação à Internet e tente novamente."
      );
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p
        role="status"
        className="rounded-card bg-green-50 p-5 text-sm leading-relaxed text-green-900"
      >
        <strong className="font-heading text-base">Mensagem enviada.</strong>
        <br />
        Obrigado pelo contacto. Respondemos para o email que indicou.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {/* Honeypot anti-spam — invisível para pessoas */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Não preencher</label>
        <input id="website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="label">Nome *</label>
          <input
            id="nome" name="nome" type="text" required maxLength={120}
            className="input" autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="email" className="label">Email *</label>
          <input
            id="email" name="email" type="email" required
            className="input" autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="assunto" className="label">Assunto *</label>
        <select id="assunto" name="assunto" required className="input" defaultValue="">
          <option value="" disabled>Escolha o assunto</option>
          <option value="Sou um stand e quero registar-me">Sou um stand e quero registar-me</option>
          <option value="Dúvida sobre um anúncio">Dúvida sobre um anúncio</option>
          <option value="Reportar um anúncio">Reportar um anúncio</option>
          <option value="Proteção de dados (RGPD)">Proteção de dados (RGPD)</option>
          <option value="Outro assunto">Outro assunto</option>
        </select>
      </div>

      <div>
        <label htmlFor="mensagem" className="label">Mensagem *</label>
        <textarea
          id="mensagem" name="mensagem" rows={6} required maxLength={3000}
          className="input"
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-brand-600">
        <input
          type="checkbox" name="consentimento" required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-300 text-accent-500 focus:ring-accent-500"
        />
        <span>
          Autorizo o tratamento dos meus dados para efeitos de resposta a este contacto,
          nos termos da{" "}
          <Link href="/politica-de-privacidade" className="underline">
            política de privacidade
          </Link>
          . *
        </span>
      </label>

      <button type="submit" className="btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "A enviar…" : "Enviar mensagem"}
      </button>
    </form>
  );
}
