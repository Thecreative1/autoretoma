"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addIssue,
  addPhoto,
  deleteIssue,
  saveConditions,
  type ActionState,
} from "@/app/painel/anuncios/actions";
import { createClient } from "@/lib/supabase/client";
import { compressImage, validateImage } from "@/lib/image";
import {
  AREA_LABELS,
  CONDITION_AREAS,
  CONDITION_STATUS_META,
  SEVERITY_META,
} from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { ConditionStatus, ListingCondition, ListingIssue } from "@/lib/types";

function ConditionsSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "A guardar…" : "Guardar estado"}
    </button>
  );
}

export function Step3Conditions({
  listingId,
  userId,
  conditions,
  issues,
}: {
  listingId: string;
  userId: string;
  conditions: ListingCondition[];
  issues: ListingIssue[];
}) {
  const router = useRouter();
  const [condState, condAction] = useActionState<ActionState, FormData>(saveConditions, {
    ok: false,
  });

  const [showIssueForm, setShowIssueForm] = useState(issues.length === 0);
  const [issueErrors, setIssueErrors] = useState<Record<string, string>>({});
  const [issueMessage, setIssueMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const byArea = new Map(conditions.map((c) => [c.area, c.status]));

  function pickFile(file: File | undefined) {
    setIssueMessage(null);
    if (!file) {
      setPreview(null);
      return;
    }
    const problem = validateImage(file);
    if (problem) {
      setIssueMessage(problem);
      if (fileRef.current) fileRef.current.value = "";
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  /**
   * Carrega a fotografia (se houver) e cria o problema numa só operação,
   * para o stand não ter de sair deste passo.
   */
  async function submitIssue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setBusy(true);
    setIssueErrors({});
    setIssueMessage(null);

    try {
      const file = fileRef.current?.files?.[0];

      if (file) {
        const problem = validateImage(file);
        if (problem) {
          setIssueMessage(problem);
          return;
        }

        const supabase = createClient();
        const blob = await compressImage(file);
        // A política de storage exige que a primeira pasta seja o id do utilizador.
        const path = `${userId}/${listingId}/${crypto.randomUUID()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });

        if (uploadError) {
          setIssueMessage(`Não foi possível carregar a fotografia: ${uploadError.message}`);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("listings").getPublicUrl(path);

        // Entra também na galeria do anúncio, marcada como defeito.
        const photoData = new FormData();
        photoData.set("listing_id", listingId);
        photoData.set("url", publicUrl);
        photoData.set("category", "defeito");
        const photoResult = await addPhoto(photoData);
        if (!photoResult.ok && photoResult.message) {
          setIssueMessage(photoResult.message);
          return;
        }

        data.set("photo_url", publicUrl);
      }

      const result = await addIssue({ ok: false }, data);
      if (!result.ok) {
        if (result.errors) setIssueErrors(result.errors);
        if (result.message) setIssueMessage(result.message);
        return;
      }

      form.reset();
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setShowIssueForm(false);
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Estado por área */}
      <section>
        <h3 className="font-heading text-lg font-bold">Estado por área</h3>
        <p className="mt-1 text-sm text-brand-600">
          Classifique cada área da viatura. É esta informação que o comprador vê antes de
          o contactar.
        </p>

        <form action={condAction} className="mt-5 space-y-4">
          <input type="hidden" name="listing_id" value={listingId} />

          {condState.message && (
            <p
              role="status"
              className={`rounded-lg p-3 text-sm ${
                condState.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {condState.message}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {CONDITION_AREAS.map((area) => (
              <div key={area.value}>
                <label htmlFor={`area_${area.value}`} className="label">
                  {area.label}
                </label>
                <select
                  id={`area_${area.value}`}
                  name={`area_${area.value}`}
                  className="input"
                  defaultValue={byArea.get(area.value) ?? "nao_verificado"}
                >
                  {(Object.keys(CONDITION_STATUS_META) as ConditionStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {CONDITION_STATUS_META[status].label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <ConditionsSubmit />
        </form>
      </section>

      {/* Problemas declarados */}
      <section className="border-t border-brand-100 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-bold">Problemas declarados</h3>
            <p className="mt-1 text-sm text-brand-600">
              Descreva cada problema conhecido e junte-lhe uma fotografia. Declarar
              problemas é o que distingue a AutoRetoma — não os omita.
            </p>
          </div>
          {!showIssueForm && (
            <button type="button" onClick={() => setShowIssueForm(true)} className="btn-outline">
              Adicionar problema
            </button>
          )}
        </div>

        {issues.length > 0 && (
          <ul className="mt-5 space-y-3">
            {issues.map((issue) => (
              <li key={issue.id} className="rounded-card border border-brand-200 bg-brand-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                      {AREA_LABELS[issue.area]}
                    </p>
                    <h4 className="mt-0.5 font-heading text-base font-bold">{issue.title}</h4>
                    <p className="mt-1 text-sm text-brand-700">{issue.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`badge ${SEVERITY_META[issue.severity].badge}`}>
                        {SEVERITY_META[issue.severity].label}
                      </span>
                      {issue.repair_estimate_eur != null && (
                        <span className="badge bg-white text-brand-700 ring-1 ring-brand-200">
                          Reparação: {formatPrice(issue.repair_estimate_eur)}
                        </span>
                      )}
                      <span
                        className={`badge ${
                          issue.prevents_driving
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {issue.prevents_driving ? "Impede a circulação" : "O carro circula"}
                      </span>
                      {!issue.photo_url && (
                        <span className="badge bg-amber-100 text-amber-800">Sem fotografia</span>
                      )}
                    </div>
                  </div>

                  <form action={deleteIssue}>
                    <input type="hidden" name="listing_id" value={listingId} />
                    <input type="hidden" name="issue_id" value={issue.id} />
                    <button type="submit" className="btn-outline px-3 py-1.5 text-xs">
                      Remover
                    </button>
                  </form>
                </div>

                {issue.photo_url && (
                  <div className="relative mt-3 aspect-[16/10] w-40 overflow-hidden rounded-lg border-2 border-accent-300">
                    <Image src={issue.photo_url} alt="" fill sizes="160px" className="object-cover" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {showIssueForm && (
          <form ref={formRef} onSubmit={submitIssue} className="card mt-5 space-y-4 p-5">
            <input type="hidden" name="listing_id" value={listingId} />

            {issueMessage && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {issueMessage}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="area" className="label">Área *</label>
                <select id="area" name="area" required className="input" defaultValue="">
                  <option value="" disabled>Escolha a área</option>
                  {CONDITION_AREAS.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
                {issueErrors.area && <p className="mt-1 text-xs text-red-700">{issueErrors.area}</p>}
              </div>

              <div>
                <label htmlFor="severity" className="label">Gravidade *</label>
                <select id="severity" name="severity" required className="input" defaultValue="media">
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="label">Título *</label>
              <input
                id="title" name="title" type="text" required maxLength={120} className="input"
                placeholder="Ex.: Embraiagem com desgaste avançado"
              />
              {issueErrors.title && <p className="mt-1 text-xs text-red-700">{issueErrors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="label">Descrição *</label>
              <textarea
                id="description" name="description" rows={3} required maxLength={2000} className="input"
                placeholder="Explique o que se passa, em que condições se nota e o que o comprador deve esperar."
              />
              {issueErrors.description && (
                <p className="mt-1 text-xs text-red-700">{issueErrors.description}</p>
              )}
            </div>

            {/* Fotografia carregada aqui mesmo, sem sair do passo */}
            <div className="rounded-lg border border-dashed border-brand-300 bg-brand-50 p-4">
              <label htmlFor="issue-photo" className="label">
                Fotografia deste problema
              </label>
              <input
                ref={fileRef}
                id="issue-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={(e) => pickFile(e.target.files?.[0])}
                className="block w-full text-sm text-brand-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent-600 disabled:opacity-60"
              />
              <p className="mt-1.5 text-xs text-brand-600">
                Uma fotografia clara do defeito evita deslocações inúteis e perguntas
                repetidas. Fica também na galeria do anúncio, assinalada como defeito.
              </p>

              {preview && (
                <div className="relative mt-3 aspect-[16/10] w-44 overflow-hidden rounded-lg border-2 border-accent-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Pré-visualização do defeito" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="repair_estimate_eur" className="label">
                Estimativa de reparação (€)
              </label>
              <input
                id="repair_estimate_eur" name="repair_estimate_eur" type="number" min={0}
                className="input sm:max-w-xs" placeholder="Opcional"
              />
            </div>

            <label className="flex items-start gap-2.5 text-sm text-brand-700">
              <input
                type="checkbox" name="prevents_driving"
                className="mt-0.5 h-4 w-4 rounded border-brand-300 text-accent-500 focus:ring-accent-500"
              />
              <span>Este problema impede a circulação da viatura</span>
            </label>

            <div className="flex items-center gap-3 border-t border-brand-100 pt-4">
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? "A guardar…" : "Adicionar problema"}
              </button>
              {issues.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowIssueForm(false);
                    setPreview(null);
                    setIssueMessage(null);
                  }}
                  className="btn-outline"
                  disabled={busy}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}

        {issues.length === 0 && !showIssueForm && (
          <p className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-900">
            Este anúncio não declara problemas. Se o carro não tem defeitos conhecidos,
            pode avançar — mas confirme antes que nada ficou por declarar.
          </p>
        )}
      </section>

      <div className="flex items-center justify-between border-t border-brand-100 pt-5">
        <Link href={`/painel/anuncios/${listingId}?passo=2`} className="btn-outline">
          Voltar
        </Link>
        <Link href={`/painel/anuncios/${listingId}?passo=4`} className="btn-primary">
          Continuar para fotografias
        </Link>
      </div>
    </div>
  );
}
