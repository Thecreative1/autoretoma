import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getOwnStand } from "@/lib/auth";
import { LISTING_STATUS_META } from "@/lib/constants";
import { formatMileage, formatNumber, formatPrice, firstParam } from "@/lib/utils";
import { changeListingStatus, duplicateListing } from "./actions";
import type { ListingStatus } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface Row {
  id: string;
  slug: string | null;
  status: ListingStatus;
  price: number;
  mileage: number;
  year: number;
  views_count: number;
  admin_feedback: string | null;
  brand: { name: string };
  model: { name: string };
  photos: { url: string; sort_order: number; is_defect: boolean }[];
  leads: { id: string }[];
}

export default async function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const submitted = firstParam(sp.submetido) === "1";

  const stand = await getOwnStand();
  if (!stand) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      `id, slug, status, price, mileage, year, views_count, admin_feedback,
       brand:brands(name), model:models(name),
       photos:listing_photos(url, sort_order, is_defect),
       leads(id)`
    )
    .eq("stand_id", stand.id)
    .order("updated_at", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      {submitted && (
        <p role="status" className="rounded-card bg-green-50 p-4 text-sm text-green-900">
          <strong>Anúncio enviado para aprovação.</strong> A equipa da AutoRetoma vai
          analisá-lo. Recebe o resultado nesta página.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold">Os meus anúncios</h2>
        <Link href="/painel/anuncios/novo" className="btn-primary">Criar anúncio</Link>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center">
          <h3 className="font-heading text-lg font-bold">Ainda não tem anúncios</h3>
          <p className="mt-2 text-sm text-brand-600">
            Crie o primeiro anúncio com fotografias e os problemas conhecidos declarados.
          </p>
          <Link href="/painel/anuncios/novo" className="btn-primary mt-6">
            Criar anúncio
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => {
            const cover = [...row.photos].sort((a, b) => a.sort_order - b.sort_order)[0];
            const meta = LISTING_STATUS_META[row.status];
            const editable = row.status === "rascunho" || row.status === "alteracoes_necessarias";

            return (
              <li key={row.id} className="card overflow-hidden">
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-brand-100 sm:h-24 sm:w-36">
                    {cover ? (
                      <Image src={cover.url} alt="" fill sizes="144px" className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-brand-400">
                        Sem foto
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-heading text-base font-bold text-brand-900">
                          {row.brand.name} {row.model.name} {row.year}
                        </h3>
                        <p className="mt-0.5 text-sm text-brand-600">
                          {formatPrice(row.price)} · {formatMileage(row.mileage)}
                        </p>
                      </div>
                      <span className={`badge ${meta.badge}`}>{meta.label}</span>
                    </div>

                    <p className="mt-2 text-xs text-brand-500">
                      {formatNumber(row.views_count)} visualizações ·{" "}
                      {row.leads.length} {row.leads.length === 1 ? "contacto" : "contactos"}
                    </p>

                    {row.status === "alteracoes_necessarias" && row.admin_feedback && (
                      <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                        <strong>Alterações pedidas:</strong> {row.admin_feedback}
                      </p>
                    )}
                    {row.status === "rejeitado" && row.admin_feedback && (
                      <p className="mt-2 rounded-lg bg-red-50 p-3 text-xs leading-relaxed text-red-900">
                        <strong>Motivo da rejeição:</strong> {row.admin_feedback}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/painel/anuncios/${row.id}`} className="btn-outline px-3 py-1.5 text-xs">
                        {editable ? "Editar" : "Ver detalhes"}
                      </Link>

                      {row.slug && ["publicado", "reservado", "vendido"].includes(row.status) && (
                        <Link
                          href={`/carros/${row.slug}`}
                          className="btn-outline px-3 py-1.5 text-xs"
                          target="_blank"
                        >
                          Ver anúncio público
                        </Link>
                      )}

                      {row.status === "publicado" && (
                        <form action={changeListingStatus}>
                          <input type="hidden" name="listing_id" value={row.id} />
                          <input type="hidden" name="status" value="reservado" />
                          <button type="submit" className="btn-outline px-3 py-1.5 text-xs">
                            Marcar como reservado
                          </button>
                        </form>
                      )}

                      {row.status === "reservado" && (
                        <form action={changeListingStatus}>
                          <input type="hidden" name="listing_id" value={row.id} />
                          <input type="hidden" name="status" value="publicado" />
                          <button type="submit" className="btn-outline px-3 py-1.5 text-xs">
                            Voltar a disponível
                          </button>
                        </form>
                      )}

                      {(row.status === "publicado" || row.status === "reservado") && (
                        <form action={changeListingStatus}>
                          <input type="hidden" name="listing_id" value={row.id} />
                          <input type="hidden" name="status" value="vendido" />
                          <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                            Marcar como vendido
                          </button>
                        </form>
                      )}

                      <form action={duplicateListing}>
                        <input type="hidden" name="listing_id" value={row.id} />
                        <button type="submit" className="btn-outline px-3 py-1.5 text-xs">
                          Duplicar
                        </button>
                      </form>

                      {["publicado", "reservado", "vendido"].includes(row.status) && (
                        <form action={changeListingStatus}>
                          <input type="hidden" name="listing_id" value={row.id} />
                          <input type="hidden" name="status" value="arquivado" />
                          <button type="submit" className="btn-outline px-3 py-1.5 text-xs">
                            Arquivar
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
