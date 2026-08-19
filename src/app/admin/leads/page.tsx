import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUS_META } from "@/lib/constants";
import { formatDate, timeAgo } from "@/lib/utils";
import { setLeadStatusAdmin } from "../actions";
import type { LeadStatus } from "@/lib/types";

interface Row {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: LeadStatus;
  created_at: string;
  stand: { commercial_name: string } | null;
  listing: {
    slug: string | null;
    year: number;
    brand: { name: string };
    model: { name: string };
  } | null;
}

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select(
      `id, name, email, phone, message, status, created_at,
       stand:stands(commercial_name),
       listing:listings(slug, year, brand:brands(name), model:models(name))`
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const leads = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg font-bold">Contactos gerados</h2>
        <p className="mt-1 text-sm text-brand-600">
          Todos os pedidos de contacto enviados pelos compradores, com o anúncio e o stand
          associados. Os 200 mais recentes.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-brand-600">Ainda não foram gerados contactos.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => (
            <li key={lead.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-heading text-base font-bold text-brand-900">{lead.name}</h3>
                  <p className="mt-0.5 text-sm text-brand-600">
                    {lead.listing ? (
                      lead.listing.slug ? (
                        <Link href={`/carros/${lead.listing.slug}`} target="_blank" className="underline">
                          {lead.listing.brand.name} {lead.listing.model.name} {lead.listing.year}
                        </Link>
                      ) : (
                        `${lead.listing.brand.name} ${lead.listing.model.name} ${lead.listing.year}`
                      )
                    ) : (
                      "Anúncio removido"
                    )}
                    {lead.stand && <> · {lead.stand.commercial_name}</>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${LEAD_STATUS_META[lead.status].badge}`}>
                    {LEAD_STATUS_META[lead.status].label}
                  </span>
                  <span className="text-xs text-brand-500" title={formatDate(lead.created_at)}>
                    {timeAgo(lead.created_at)}
                  </span>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line rounded-lg bg-brand-50 p-3 text-sm leading-relaxed text-brand-700">
                {lead.message}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-brand-600">
                <span>{lead.email}</span>
                {lead.phone && <span>· {lead.phone}</span>}

                {(["novo", "contactado", "fechado"] as LeadStatus[])
                  .filter((s) => s !== lead.status)
                  .map((s) => (
                    <form key={s} action={setLeadStatusAdmin}>
                      <input type="hidden" name="lead_id" value={lead.id} />
                      <input type="hidden" name="status" value={s} />
                      <button type="submit" className="btn-outline px-3 py-1 text-xs">
                        Marcar como {LEAD_STATUS_META[s].label.toLowerCase()}
                      </button>
                    </form>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
