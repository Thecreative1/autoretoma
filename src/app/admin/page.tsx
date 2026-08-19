import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatNumber, formatPrice } from "@/lib/utils";
import { LISTING_STATUS_META } from "@/lib/constants";
import type { ListingStatus } from "@/lib/types";

export default async function AdminStatsPage() {
  const supabase = await createClient();

  const [
    { count: standsTotal },
    { count: standsApproved },
    { count: standsPending },
    { data: listings },
    { count: leadsTotal },
    { data: topListings },
  ] = await Promise.all([
    supabase.from("stands").select("id", { count: "exact", head: true }),
    supabase.from("stands").select("id", { count: "exact", head: true }).eq("status", "aprovado"),
    supabase.from("stands").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("listings").select("status, views_count, price"),
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select(
        `id, slug, status, price, views_count, year,
         brand:brands(name), model:models(name),
         stand:stands(commercial_name), leads(id)`
      )
      .in("status", ["publicado", "reservado", "vendido"])
      .limit(50),
  ]);

  const all = (listings ?? []) as { status: ListingStatus; views_count: number; price: number | null }[];
  const activeCount = all.filter((l) => ["publicado", "reservado"].includes(l.status)).length;
  const soldCount = all.filter((l) => l.status === "vendido").length;
  const pendingModeration = all.filter((l) => l.status === "em_analise").length;
  const totalViews = all.reduce((sum, l) => sum + l.views_count, 0);

  const top = ((topListings ?? []) as unknown as {
    id: string;
    slug: string | null;
    status: ListingStatus;
    price: number;
    views_count: number;
    year: number;
    brand: { name: string };
    model: { name: string };
    stand: { commercial_name: string };
    leads: { id: string }[];
  }[])
    .sort((a, b) => b.leads.length - a.leads.length || b.views_count - a.views_count)
    .slice(0, 8);

  const stats = [
    { label: "Stands registados", value: formatNumber(standsTotal ?? 0), href: "/admin/stands" },
    { label: "Stands aprovados", value: formatNumber(standsApproved ?? 0), href: "/admin/stands" },
    { label: "Anúncios ativos", value: formatNumber(activeCount) },
    { label: "Anúncios vendidos", value: formatNumber(soldCount) },
    { label: "Visualizações", value: formatNumber(totalViews) },
    { label: "Contactos gerados", value: formatNumber(leadsTotal ?? 0), href: "/admin/leads" },
  ];

  return (
    <div className="space-y-8">
      {(standsPending ?? 0) > 0 || pendingModeration > 0 ? (
        <div className="rounded-card border-l-4 border-accent-500 bg-accent-50 p-5">
          <h2 className="font-heading text-base font-bold text-brand-900">A precisar de atenção</h2>
          <ul className="mt-2 space-y-1 text-sm text-brand-800">
            {(standsPending ?? 0) > 0 && (
              <li>
                <Link href="/admin/stands?estado=pendente" className="font-semibold underline">
                  {standsPending} {standsPending === 1 ? "stand aguarda" : "stands aguardam"} verificação
                </Link>
              </li>
            )}
            {pendingModeration > 0 && (
              <li>
                <Link href="/admin/anuncios?estado=em_analise" className="font-semibold underline">
                  {pendingModeration} {pendingModeration === 1 ? "anúncio aguarda" : "anúncios aguardam"} moderação
                </Link>
              </li>
            )}
          </ul>
        </div>
      ) : (
        <p className="rounded-card bg-green-50 p-5 text-sm text-green-900">
          Não há stands nem anúncios a aguardar decisão.
        </p>
      )}

      <section aria-labelledby="stats">
        <h2 id="stats" className="font-heading text-lg font-bold">Estatísticas</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="card p-4">
              <dt className="text-xs font-medium text-brand-500">{s.label}</dt>
              <dd className="mt-1 font-heading text-2xl font-extrabold text-brand-900">
                {s.href ? (
                  <Link href={s.href} className="hover:text-accent-600">{s.value}</Link>
                ) : (
                  s.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="top" className="card p-6">
        <h2 id="top" className="font-heading text-lg font-bold">
          Anúncios com mais contactos
        </h2>
        {top.length === 0 ? (
          <p className="mt-4 text-sm text-brand-600">Ainda não existem anúncios publicados.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-brand-200 text-left text-xs uppercase tracking-wide text-brand-500">
                  <th className="pb-2 pr-4 font-semibold">Anúncio</th>
                  <th className="pb-2 pr-4 font-semibold">Stand</th>
                  <th className="pb-2 pr-4 font-semibold">Preço</th>
                  <th className="pb-2 pr-4 font-semibold">Estado</th>
                  <th className="pb-2 pr-4 text-right font-semibold">Vistas</th>
                  <th className="pb-2 text-right font-semibold">Contactos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {top.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2.5 pr-4">
                      {l.slug ? (
                        <Link href={`/carros/${l.slug}`} className="font-medium hover:text-accent-600" target="_blank">
                          {l.brand.name} {l.model.name} {l.year}
                        </Link>
                      ) : (
                        `${l.brand.name} ${l.model.name} ${l.year}`
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-brand-600">{l.stand.commercial_name}</td>
                    <td className="py-2.5 pr-4">{formatPrice(l.price)}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`badge ${LISTING_STATUS_META[l.status].badge}`}>
                        {LISTING_STATUS_META[l.status].label}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right">{formatNumber(l.views_count)}</td>
                    <td className="py-2.5 text-right font-semibold">{l.leads.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
