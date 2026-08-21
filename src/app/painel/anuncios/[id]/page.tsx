import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { WizardSteps, WIZARD_STEPS } from "@/components/painel/WizardSteps";
import { Step1Form } from "@/components/painel/Step1Form";
import { Step2Form } from "@/components/painel/Step2Form";
import { Step3Conditions } from "@/components/painel/Step3Conditions";
import { Step4Photos } from "@/components/painel/Step4Photos";
import { Step5Form } from "@/components/painel/Step5Form";
import { Step6Submit } from "@/components/painel/Step6Submit";
import { ConditionReport } from "@/components/listing/ConditionReport";
import { createClient } from "@/lib/supabase/server";
import { getOwnStand, requireUser } from "@/lib/auth";
import { getBrands, getModels, getSettings } from "@/lib/queries";
import {
  FUEL_LABELS,
  GEARBOX_LABELS,
  LISTING_STATUS_META,
  PHOTO_CATEGORIES,
} from "@/lib/constants";
import { firstParam, formatMileage, formatPrice, toInt } from "@/lib/utils";
import { changeListingStatus, deleteListing } from "../actions";
import type { Listing, ListingCondition, ListingIssue, ListingPhoto } from "@/lib/types";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser();
  const stand = await getOwnStand();
  if (!stand) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      `*, brand:brands(name), model:models(name),
       photos:listing_photos(*), conditions:listing_conditions(*), issues:listing_issues(*)`
    )
    .eq("id", id)
    .eq("stand_id", stand.id)
    .maybeSingle();

  if (!data) notFound();

  const listing = data as unknown as Listing & {
    brand: { name: string };
    model: { name: string };
    photos: ListingPhoto[];
    conditions: ListingCondition[];
    issues: ListingIssue[];
  };

  const photos = [...listing.photos].sort((a, b) => a.sort_order - b.sort_order);
  const issues = [...listing.issues].sort((a, b) => a.sort_order - b.sort_order);
  const editable = listing.status === "rascunho" || listing.status === "alteracoes_necessarias";
  const step = Math.min(6, Math.max(1, toInt(firstParam(sp.passo)) ?? 1));

  const [brands, models, settings] = await Promise.all([getBrands(), getModels(), getSettings()]);

  // Requisitos em falta para submissão
  const present = new Set(photos.map((p) => p.category));
  const blockers: string[] = [];
  if (photos.length < settings.min_photos) {
    blockers.push(
      `Faltam fotografias: tem ${photos.length}, são necessárias ${settings.min_photos}.`
    );
  }
  const missingRequired = PHOTO_CATEGORIES.filter((c) => c.required && !present.has(c.value));
  if (missingRequired.length > 0) {
    blockers.push(`Fotografias obrigatórias em falta: ${missingRequired.map((c) => c.label).join(", ")}.`);
  }
  if (listing.price == null) blockers.push("Indique o preço no passo 5.");
  else if (listing.price > settings.max_price_eur) {
    blockers.push(
      `O preço excede o limite atual da plataforma (${settings.max_price_eur.toLocaleString("pt-PT")} €).`
    );
  }
  if (!listing.district) blockers.push("Indique o distrito no passo 5.");
  if (listing.conditions.every((c) => c.status === "nao_verificado")) {
    blockers.push("Classifique o estado da viatura no passo 3.");
  }

  const statusMeta = LISTING_STATUS_META[listing.status];
  const title = `${listing.brand.name} ${listing.model.name} ${listing.year}`;

  return (
    <div className="max-w-4xl">
      <nav aria-label="Caminho" className="mb-4 text-sm text-brand-500">
        <Link href="/painel/anuncios" className="hover:text-accent-600">Anúncios</Link>
        <span aria-hidden="true" className="mx-1.5">/</span>
        <span className="text-brand-800">{title}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-extrabold">{title}</h2>
          <p className="mt-1 text-sm text-brand-600">
            {listing.price != null ? formatPrice(listing.price) : "Sem preço definido"} ·{" "}
            {formatMileage(listing.mileage)} · {FUEL_LABELS[listing.fuel]} ·{" "}
            {GEARBOX_LABELS[listing.gearbox]}
          </p>
        </div>
        <span className={`badge ${statusMeta.badge}`}>{statusMeta.label}</span>
      </div>

      {listing.admin_feedback && (listing.status === "alteracoes_necessarias" || listing.status === "rejeitado") && (
        <p className="mt-4 rounded-card bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <strong>Nota da moderação:</strong> {listing.admin_feedback}
        </p>
      )}

      {!editable ? (
        // Anúncio já submetido ou publicado: consulta e gestão de estado
        <div className="mt-6 space-y-6">
          <div className="card p-6">
            <h3 className="font-heading text-lg font-bold">Anúncio em consulta</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-600">
              {listing.status === "em_analise"
                ? "O anúncio está em análise pela equipa da AutoRetoma. Para o alterar, retire-o da fila de aprovação."
                : "Anúncios publicados não podem ser editados diretamente. Pode gerir o estado abaixo ou arquivar e criar uma nova versão através da opção Duplicar."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {listing.slug && ["publicado", "reservado", "vendido"].includes(listing.status) && (
                <Link href={`/carros/${listing.slug}`} target="_blank" className="btn-outline">
                  Ver anúncio público
                </Link>
              )}

              {listing.status === "em_analise" && (
                <form action={changeListingStatus}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <input type="hidden" name="status" value="rascunho" />
                  <button type="submit" className="btn-outline">
                    Retirar da aprovação e voltar a editar
                  </button>
                </form>
              )}

              {listing.status === "publicado" && (
                <form action={changeListingStatus}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <input type="hidden" name="status" value="reservado" />
                  <button type="submit" className="btn-outline">Marcar como reservado</button>
                </form>
              )}

              {listing.status === "reservado" && (
                <form action={changeListingStatus}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <input type="hidden" name="status" value="publicado" />
                  <button type="submit" className="btn-outline">Voltar a disponível</button>
                </form>
              )}

              {(listing.status === "publicado" || listing.status === "reservado") && (
                <form action={changeListingStatus}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <input type="hidden" name="status" value="vendido" />
                  <button type="submit" className="btn-secondary">Marcar como vendido</button>
                </form>
              )}
            </div>
          </div>

          <section className="card p-6">
            <h3 className="font-heading text-lg font-bold">Fotografias ({photos.length})</h3>
            <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photos.map((p) => (
                <li key={p.id} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-brand-100">
                  <Image src={p.url} alt="" fill sizes="150px" className="object-cover" />
                  {p.is_defect && (
                    <span className="badge absolute left-1.5 top-1.5 bg-accent-500 text-white">
                      Defeito
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <ConditionReport conditions={listing.conditions} issues={issues} />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <WizardSteps current={step} listingId={listing.id} />
          </div>

          <div className="card p-6">
            <h3 className="mb-1 font-heading text-lg font-bold">
              Passo {step} de 6 — {WIZARD_STEPS[step - 1].label}
            </h3>

            {step === 1 && (
              <div className="mt-5">
                <Step1Form brands={brands} models={models} listing={listing} />
              </div>
            )}
            {step === 2 && (
              <div className="mt-5">
                <Step2Form listing={listing} />
              </div>
            )}
            {step === 3 && (
              <div className="mt-5">
                <Step3Conditions
                  listingId={listing.id}
                  userId={user.id}
                  conditions={listing.conditions}
                  issues={issues}
                />
              </div>
            )}
            {step === 4 && (
              <div className="mt-5">
                <Step4Photos
                  listingId={listing.id}
                  userId={user.id}
                  photos={photos}
                  minPhotos={settings.min_photos}
                />
              </div>
            )}
            {step === 5 && (
              <div className="mt-5">
                <Step5Form
                  listing={listing}
                  maxPrice={settings.max_price_eur}
                  standDistrict={stand.district}
                />
              </div>
            )}
            {step === 6 && (
              <div className="mt-5 space-y-8">
                <section>
                  <h4 className="font-heading text-base font-bold">Pré-visualização</h4>
                  <p className="mt-1 text-sm text-brand-600">
                    É assim que o comprador vê a informação sobre o estado da viatura.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-card border border-brand-100 p-4">
                      <p className="font-heading text-base font-bold">{title}</p>
                      <p className="mt-1 text-sm text-brand-600">{listing.version ?? "—"}</p>
                      <p className="mt-3 font-heading text-2xl font-extrabold">
                        {listing.price != null ? formatPrice(listing.price) : "Sem preço"}
                      </p>
                      <p className="mt-1 text-sm text-brand-600">
                        {formatMileage(listing.mileage)} · {FUEL_LABELS[listing.fuel]} ·{" "}
                        {listing.municipality ?? listing.district ?? "Sem localização"}
                      </p>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-brand-100">
                      {photos[0] ? (
                        <Image src={photos[0].url} alt="" fill sizes="300px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-sm text-brand-400">
                          Sem fotografias
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <ConditionReport conditions={listing.conditions} issues={issues} />
                  </div>
                </section>

                <Step6Submit
                  listingId={listing.id}
                  blockers={blockers}
                  standApproved={stand.status === "aprovado"}
                />
              </div>
            )}
          </div>

          {listing.status === "rascunho" && (
            <form action={deleteListing} className="mt-6">
              <input type="hidden" name="listing_id" value={listing.id} />
              <button type="submit" className="text-sm font-semibold text-red-700 hover:text-red-800">
                Eliminar este rascunho
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
