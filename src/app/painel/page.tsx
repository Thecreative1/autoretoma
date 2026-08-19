import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOwnStand } from "@/lib/auth";
import { LISTING_STATUS_META } from "@/lib/constants";
import { formatNumber, formatPrice, timeAgo } from "@/lib/utils";
import type { ListingStatus } from "@/lib/types";
import { firstParam } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DashboardHome({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const justRegistered = firstParam(sp.registo) === "sucesso";

  const stand = await getOwnStand();
  if (!stand) return null;

  const supabase = await createClient();

  const [{ data: listings }, { data: leads }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, slug, status, price, views_count, brand:brands(name), model:models(name), year, updated_at")
      .eq("stand_id", stand.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("leads")
      .select("id, name, created_at, status, listing:listings(slug, brand:brands(name), model:models(name))")
      .eq("stand_id", stand.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const all = (listings ?? []) as unknown as {
    id: string;
    slug: string | null;
    status: ListingStatus;
    price: number;
    views_count: number;
    year: number;
    updated_at: string;
    brand: { name: string };
    model: { name: string };
  }[];

  const countBy = (s: ListingStatus[]) => all.filter((l) => s.includes(l.status)).length;
  const totalViews = all.reduce((sum, l) => sum + l.views_count, 0);

  const { count: leadCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("stand_id", stand.id);

  const stats = [
    { label: "Anúncios publicados", value: formatNumber(countBy(["publicado", "reservado"])) },
    { label: "Em análise", value: formatNumber(countBy(["em_analise"])) },
    { label: "Rascunhos", value: formatNumber(countBy(["rascunho", "alteracoes_necessarias"])) },
    { label: "Vendidos", value: formatNumber(countBy(["vendido"])) },
    { label: "Visualizações", value: formatNumber(totalViews) },
    { label: "Contactos recebidos", value: formatNumber(leadCount ?? 0) },
  ];

  const recentLeads = (leads ?? []) as unknown as {
    id: string;
    name: string;
    created_at: string;
    status: string;
    listing: { slug: string | null; brand: { name: string }; model: { name: string } } | null;
  }[];

  return (
    <div className="space-y-8">
      {justRegistered && (
        <div role="status" className="rounded-card bg-green-50 p-5 text-sm leading-relaxed text-green-900">
          <strong className="font-heading text-base">Registo submetido com sucesso.</strong>
          <p className="mt-1">
            A sua conta está a aguardar verificação. Enquanto isso, pode já preparar os
            seus anúncios como rascunho.
          </p>
        </div>
      )}

      <section aria-labelledby="estatisticas">
        <h2 id="estatisticas" className="font-heading text-lg font-bold">Resumo</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="card p-4">
              <dt className="text-xs font-medium text-brand-500">{s.label}</dt>
              <dd className="mt-1 font-heading text-2xl font-extrabold text-brand-900">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="anuncios-recentes" className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 id="anuncios-recentes" className="font-heading text-lg font-bold">
              Anúncios recentes
            </h2>
            <Link href="/painel/anuncios" className="text-sm font-semibold text-accent-600">
              Ver todos
            </Link>
          </div>

          {all.length > 0 ? (
            <ul className="mt-4 divide-y divide-brand-100">
              {all.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-900">
                      {l.brand.name} {l.model.name} {l.year}
                    </p>
                    <p className="text-xs text-brand-500">
                      {formatPrice(l.price)} · {formatNumber(l.views_count)} visualizações
                    </p>
                  </div>
                  <span className={`badge shrink-0 ${LISTING_STATUS_META[l.status].badge}`}>
                    {LISTING_STATUS_META[l.status].label}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 text-center">
              <p className="text-sm text-brand-600">Ainda não criou nenhum anúncio.</p>
              <Link href="/painel/anuncios/novo" className="btn-primary mt-4">
                Criar o primeiro anúncio
              </Link>
            </div>
          )}
        </section>

        <section aria-labelledby="contactos-recentes" className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 id="contactos-recentes" className="font-heading text-lg font-bold">
              Contactos recentes
            </h2>
            <Link href="/painel/contactos" className="text-sm font-semibold text-accent-600">
              Ver todos
            </Link>
          </div>

          {recentLeads.length > 0 ? (
            <ul className="mt-4 divide-y divide-brand-100">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="py-3">
                  <p className="text-sm font-semibold text-brand-900">{lead.name}</p>
                  <p className="text-xs text-brand-500">
                    {lead.listing
                      ? `${lead.listing.brand.name} ${lead.listing.model.name}`
                      : "Anúncio removido"}{" "}
                    · {timeAgo(lead.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-brand-600">
              Ainda não recebeu contactos. Assim que alguém pedir informações sobre um
              anúncio, aparece aqui.
            </p>
          )}
        </section>
      </div>

      <section className="card p-6">
        <h2 className="font-heading text-lg font-bold">Ações rápidas</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/painel/anuncios/novo" className="btn-primary">Criar anúncio</Link>
          <Link href="/painel/anuncios" className="btn-outline">Gerir anúncios</Link>
          <Link href="/painel/contactos" className="btn-outline">Ver contactos</Link>
          <Link href="/painel/stand" className="btn-outline">Editar dados do stand</Link>
        </div>
      </section>
    </div>
  );
}
