import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOwnStand } from "@/lib/auth";
import { LEAD_STATUS_META } from "@/lib/constants";
import { formatDate, timeAgo } from "@/lib/utils";
import { updateLeadStatus } from "./actions";
import type { LeadStatus } from "@/lib/types";

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: LeadStatus;
  created_at: string;
  listing: {
    slug: string | null;
    year: number;
    brand: { name: string };
    model: { name: string };
  } | null;
}

export default async function LeadsPage() {
  const stand = await getOwnStand();
  if (!stand) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select(
      `id, name, email, phone, message, status, created_at,
       listing:listings(slug, year, brand:brands(name), model:models(name))`
    )
    .eq("stand_id", stand.id)
    .order("created_at", { ascending: false });

  const leads = (data ?? []) as unknown as LeadRow[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg font-bold">Contactos recebidos</h2>
        <p className="mt-1 text-sm text-brand-600">
          Pedidos de informação enviados por compradores através dos seus anúncios.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="card p-10 text-center">
          <h3 className="font-heading text-lg font-bold">Ainda não recebeu contactos</h3>
          <p className="mt-2 text-sm text-brand-600">
            Assim que um comprador pedir informações sobre um dos seus anúncios, o pedido
            aparece aqui com os dados de contacto.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {leads.map((lead) => (
            <li key={lead.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-heading text-base font-bold text-brand-900">{lead.name}</h3>
                  <p className="mt-0.5 text-sm text-brand-600">
                    {lead.listing ? (
                      lead.listing.slug ? (
                        <Link href={`/carros/${lead.listing.slug}`} className="underline" target="_blank">
                          {lead.listing.brand.name} {lead.listing.model.name} {lead.listing.year}
                        </Link>
                      ) : (
                        `${lead.listing.brand.name} ${lead.listing.model.name} ${lead.listing.year}`
                      )
                    ) : (
                      "Anúncio removido"
                    )}
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

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a href={`mailto:${lead.email}`} className="btn-outline px-3 py-1.5 text-xs">
                  {lead.email}
                </a>
                {lead.phone && (
                  <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="btn-outline px-3 py-1.5 text-xs">
                    {lead.phone}
                  </a>
                )}

                {lead.status !== "contactado" && (
                  <form action={updateLeadStatus}>
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <input type="hidden" name="status" value="contactado" />
                    <button type="submit" className="btn-outline px-3 py-1.5 text-xs">
                      Marcar como contactado
                    </button>
                  </form>
                )}
                {lead.status !== "fechado" && (
                  <form action={updateLeadStatus}>
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <input type="hidden" name="status" value="fechado" />
                    <button type="submit" className="btn-outline px-3 py-1.5 text-xs">
                      Fechar
                    </button>
                  </form>
                )}
                {lead.status !== "novo" && (
                  <form action={updateLeadStatus}>
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <input type="hidden" name="status" value="novo" />
                    <button type="submit" className="btn-outline px-3 py-1.5 text-xs">
                      Reabrir
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs leading-relaxed text-brand-500">
        Os dados dos compradores foram partilhados consigo mediante consentimento expresso,
        exclusivamente para responder a este pedido. Trate-os de acordo com o RGPD e não os
        utilize para outros fins sem novo consentimento.
      </p>
    </div>
  );
}
