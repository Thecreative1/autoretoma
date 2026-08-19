import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STAND_STATUS_META } from "@/lib/constants";
import { firstParam, formatDate } from "@/lib/utils";
import { setStandStatus } from "../actions";
import type { Stand, StandStatus } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "pendente", label: "A aguardar verificação" },
  { value: "aprovado", label: "Aprovados" },
  { value: "suspenso", label: "Suspensos" },
  { value: "rejeitado", label: "Rejeitados" },
];

export default async function AdminStandsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filter = firstParam(sp.estado) ?? "";

  const supabase = await createClient();
  let query = supabase
    .from("stands")
    .select("*, listings(id)")
    .order("created_at", { ascending: false });
  if (filter) query = query.eq("status", filter as StandStatus);

  const { data } = await query;
  const stands = (data ?? []) as unknown as (Stand & { listings: { id: string }[] })[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg font-bold">Stands</h2>
        <p className="mt-1 text-sm text-brand-600">
          Aprove, rejeite ou suspenda vendedores profissionais. Suspender ou rejeitar um
          stand arquiva automaticamente os seus anúncios públicos.
        </p>
      </div>

      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/stands?estado=${f.value}` : "/admin/stands"}
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

      {stands.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-brand-600">Nenhum stand com este estado.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {stands.map((stand) => {
            const meta = STAND_STATUS_META[stand.status];
            return (
              <li key={stand.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-bold text-brand-900">
                      {stand.commercial_name}
                      {stand.is_demo && (
                        <span className="badge ml-2 bg-brand-200 text-brand-700">Demonstração</span>
                      )}
                    </h3>
                    <p className="mt-0.5 text-sm text-brand-600">{stand.company_name}</p>
                  </div>
                  <span className={`badge ${meta.badge}`}>{meta.label}</span>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex gap-2">
                    <dt className="text-brand-500">NIF:</dt>
                    <dd className="font-medium">{stand.nif}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-brand-500">Responsável:</dt>
                    <dd className="font-medium">{stand.contact_name}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-brand-500">Distrito:</dt>
                    <dd className="font-medium">{stand.district}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-brand-500">Email:</dt>
                    <dd className="truncate font-medium">{stand.email}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-brand-500">Telefone:</dt>
                    <dd className="font-medium">{stand.phone}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-brand-500">Anúncios:</dt>
                    <dd className="font-medium">{stand.listings.length}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-brand-500">Morada:</dt>
                    <dd className="font-medium">{stand.address}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-brand-500">Registado:</dt>
                    <dd className="font-medium">{formatDate(stand.created_at)}</dd>
                  </div>
                  {stand.website && (
                    <div className="flex gap-2">
                      <dt className="text-brand-500">Website:</dt>
                      <dd className="truncate">
                        <a href={stand.website} target="_blank" rel="noopener noreferrer" className="underline">
                          {stand.website}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>

                {stand.admin_notes && (
                  <p className="mt-3 rounded-lg bg-brand-50 p-3 text-xs text-brand-700">
                    <strong>Nota interna:</strong> {stand.admin_notes}
                  </p>
                )}

                <form action={setStandStatus} className="mt-4 border-t border-brand-100 pt-4">
                  <input type="hidden" name="stand_id" value={stand.id} />
                  <label htmlFor={`notes-${stand.id}`} className="label">
                    Nota (visível para o stand em caso de rejeição ou suspensão)
                  </label>
                  <input
                    id={`notes-${stand.id}`} name="admin_notes" type="text" maxLength={500}
                    className="input" defaultValue={stand.admin_notes ?? ""}
                    placeholder="Motivo da decisão, quando aplicável"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    {stand.status !== "aprovado" && (
                      <button type="submit" name="status" value="aprovado" className="btn-primary px-4 py-2 text-xs">
                        Aprovar
                      </button>
                    )}
                    {stand.status !== "suspenso" && (
                      <button type="submit" name="status" value="suspenso" className="btn-outline px-4 py-2 text-xs">
                        Suspender
                      </button>
                    )}
                    {stand.status !== "rejeitado" && (
                      <button type="submit" name="status" value="rejeitado" className="btn-danger px-4 py-2 text-xs">
                        Rejeitar
                      </button>
                    )}
                    {stand.status !== "pendente" && (
                      <button type="submit" name="status" value="pendente" className="btn-outline px-4 py-2 text-xs">
                        Voltar a pendente
                      </button>
                    )}
                  </div>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
