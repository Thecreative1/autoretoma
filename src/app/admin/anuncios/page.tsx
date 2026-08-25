import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AREA_LABELS, LISTING_STATUS_META, SEVERITY_META, photoLabel } from "@/lib/constants";
import { firstParam, formatMileage, formatNumber, formatPrice } from "@/lib/utils";
import { moderateListing, toggleFeatured } from "../actions";
import type { ListingIssue, ListingPhoto, ListingStatus } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const FILTERS: { value: string; label: string }[] = [
  { value: "em_analise", label: "Em análise" },
  { value: "publicado", label: "Publicados" },
  { value: "reservado", label: "Reservados" },
  { value: "vendido", label: "Vendidos" },
  { value: "alteracoes_necessarias", label: "Alterações pedidas" },
  { value: "rejeitado", label: "Rejeitados" },
  { value: "rascunho", label: "Rascunhos" },
  { value: "arquivado", label: "Arquivados" },
  { value: "", label: "Todos" },
];

interface Row {
  id: string;
  slug: string | null;
  status: ListingStatus;
  price: number | null;
  mileage: number;
  year: number;
  views_count: number;
  featured: boolean;
  description: string | null;
  admin_feedback: string | null;
  district: string | null;
  municipality: string | null;
  brand: { name: string };
  model: { name: string };
  stand: { commercial_name: string; status: string };
  photos: ListingPhoto[];
  issues: ListingIssue[];
  leads: { id: string }[];
}

export default async function AdminListingsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filter = firstParam(sp.estado) ?? "em_analise";

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(
      `id, slug, status, price, mileage, year, views_count, featured, description,
       admin_feedback, district, municipality,
       brand:brands(name), model:models(name), stand:stands(commercial_name, status),
       photos:listing_photos(*), issues:listing_issues(*), leads(id)`
    )
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (filter) query = query.eq("status", filter as ListingStatus);

  const { data } = await query;
  const rows = (data ?? []) as unknown as Row[];

  const errorMessages: Record<string, string> = {
    motivo: "Indique o motivo antes de pedir alterações ou rejeitar. O texto é enviado ao stand.",
    decisao: "Decisão inválida. Tente novamente.",
    gravacao: "Não foi possível gravar a decisão. Tente novamente.",
  };
  const errorKey = firstParam(sp.erro);
  const errorMessage = errorKey ? errorMessages[errorKey] : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg font-bold">Moderação de anúncios</h2>
        <p className="mt-1 text-sm text-brand-600">
          Verifique se as fotografias e a declaração do estado cumprem as regras antes de
          aprovar. Pedir alterações ou rejeitar exige indicar o motivo.
        </p>
      </div>

      {errorMessage && (
        <p role="alert" className="rounded-card bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMessage}
        </p>
      )}

      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value || "todos"}
            href={f.value ? `/admin/anuncios?estado=${f.value}` : "/admin/anuncios?estado="}
            aria-current={filter === f.value ? "page" : undefined}
            className={
              filter === f.value
                ? "btn bg-brand-900 px-4 py-2 text-xs text-white"
                : "btn-outline px-4 py-2 text-xs"
            }
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-brand-600">Nenhum anúncio com este estado.</p>
        </div>
      ) : (
        <ul className="space-y-5">
          {rows.map((row) => {
            const photos = [...row.photos].sort((a, b) => a.sort_order - b.sort_order);
            const meta = LISTING_STATUS_META[row.status];
            const moderatable = ["em_analise", "publicado", "reservado", "alteracoes_necessarias"].includes(
              row.status
            );

            return (
              <li key={row.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-bold text-brand-900">
                      {row.brand.name} {row.model.name} {row.year}
                    </h3>
                    <p className="mt-0.5 text-sm text-brand-600">
                      {row.stand.commercial_name} ·{" "}
                      {row.price != null ? formatPrice(row.price) : "sem preço"} ·{" "}
                      {formatMileage(row.mileage)} ·{" "}
                      {row.municipality ?? row.district ?? "sem localização"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {row.featured && <span className="badge bg-accent-500 text-white">Destaque</span>}
                    <span className={`badge ${meta.badge}`}>{meta.label}</span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-brand-500">
                  {photos.length} fotografias · {row.issues.length} problemas declarados ·{" "}
                  {formatNumber(row.views_count)} visualizações · {row.leads.length} contactos
                </p>

                {photos.length > 0 && (
                  <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {/* A etiqueta é o que se modera: sem ela não há como ver se a
                        fotografia corresponde à categoria que o stand lhe deu. */}
                    {photos.map((p) => (
                      <li key={p.id} className="w-28 shrink-0">
                        <div className="relative h-20 w-28 overflow-hidden rounded-lg bg-brand-100">
                          <Image src={p.url} alt="" fill sizes="112px" className="object-cover" />
                          {p.is_defect && (
                            <span className="absolute inset-x-0 bottom-0 bg-accent-500 px-1 py-0.5 text-[10px] font-bold text-white">
                              Defeito
                            </span>
                          )}
                        </div>
                        <p
                          className="mt-1 truncate text-[11px] leading-tight text-brand-600"
                          title={photoLabel(p)}
                        >
                          {photoLabel(p)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                {row.description && (
                  <p className="mt-3 line-clamp-3 whitespace-pre-line rounded-lg bg-brand-50 p-3 text-xs leading-relaxed text-brand-700">
                    {row.description}
                  </p>
                )}

                {row.issues.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {row.issues.map((issue) => (
                      <li key={issue.id} className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-brand-800">
                          {AREA_LABELS[issue.area]}: {issue.title}
                        </span>
                        <span className={`badge ${SEVERITY_META[issue.severity].badge}`}>
                          {SEVERITY_META[issue.severity].label}
                        </span>
                        {issue.prevents_driving && (
                          <span className="badge bg-red-100 text-red-800">Impede a circulação</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {row.admin_feedback && (
                  <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                    <strong>Nota anterior:</strong> {row.admin_feedback}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-100 pt-4">
                  {row.slug && ["publicado", "reservado", "vendido"].includes(row.status) && (
                    <Link href={`/carros/${row.slug}`} target="_blank" className="btn-outline px-4 py-2 text-xs">
                      Ver anúncio público
                    </Link>
                  )}

                  {["publicado", "reservado"].includes(row.status) && (
                    <form action={toggleFeatured}>
                      <input type="hidden" name="listing_id" value={row.id} />
                      <input type="hidden" name="featured" value={row.featured ? "0" : "1"} />
                      <button type="submit" className="btn-outline px-4 py-2 text-xs">
                        {row.featured ? "Remover destaque" : "Destacar"}
                      </button>
                    </form>
                  )}
                </div>

                {moderatable && (
                  <form action={moderateListing} className="mt-3">
                    <input type="hidden" name="listing_id" value={row.id} />
                    <input type="hidden" name="estado" value={filter} />
                    <label htmlFor={`feedback-${row.id}`} className="label">
                      Motivo (obrigatório ao pedir alterações ou rejeitar)
                    </label>
                    <input
                      id={`feedback-${row.id}`} name="admin_feedback" type="text" maxLength={500}
                      className="input" placeholder="Ex.: Faltam fotografias do motor e do quadrante."
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {row.status === "em_analise" && (
                        <button type="submit" name="decision" value="aprovar" className="btn-primary px-4 py-2 text-xs">
                          Aprovar e publicar
                        </button>
                      )}
                      <button type="submit" name="decision" value="alteracoes" className="btn-outline px-4 py-2 text-xs">
                        Pedir alterações
                      </button>
                      <button type="submit" name="decision" value="rejeitar" className="btn-danger px-4 py-2 text-xs">
                        Rejeitar
                      </button>
                      <button type="submit" name="decision" value="arquivar" className="btn-outline px-4 py-2 text-xs">
                        Arquivar
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
