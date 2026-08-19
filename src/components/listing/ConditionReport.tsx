import Image from "next/image";
import type { ListingCondition, ListingIssue } from "@/lib/types";
import {
  AREA_LABELS,
  CONDITION_AREAS,
  CONDITION_STATUS_META,
  SEVERITY_META,
} from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

/**
 * Estado da viatura por área + lista de problemas declarados.
 * Sempre visível: nada fica escondido em separadores fechados.
 */
export function ConditionReport({
  conditions,
  issues,
}: {
  conditions: ListingCondition[];
  issues: ListingIssue[];
}) {
  const byArea = new Map(conditions.map((c) => [c.area, c.status]));
  const issueCount = issues.length;
  const blocking = issues.filter((i) => i.prevents_driving);

  return (
    <section aria-labelledby="estado-viatura" className="card p-6">
      <h2 id="estado-viatura" className="font-heading text-xl font-extrabold">
        Estado da viatura
      </h2>

      <p className="mt-3 rounded-lg border-l-4 border-accent-500 bg-accent-50 p-4 text-sm font-semibold leading-relaxed text-brand-900">
        {issueCount === 0
          ? "Este anúncio não declara problemas conhecidos. Confirme sempre o estado presencialmente antes de fechar negócio."
          : `Este anúncio declara ${issueCount} ${
              issueCount === 1 ? "ponto que deves conhecer" : "pontos que deves conhecer"
            } antes de contactar o stand.`}
      </p>

      {blocking.length > 0 && (
        <p className="mt-3 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800">
          Atenção: o vendedor indica que {blocking.length === 1 ? "um problema declarado impede" : "há problemas declarados que impedem"}{" "}
          a circulação da viatura.
        </p>
      )}

      {/* Grelha de áreas */}
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {CONDITION_AREAS.map((area) => {
          const status = byArea.get(area.value) ?? "nao_verificado";
          const meta = CONDITION_STATUS_META[status];
          return (
            <li
              key={area.value}
              className="flex items-center justify-between gap-3 rounded-lg border border-brand-100 px-3.5 py-3"
            >
              <span className="text-sm font-medium text-brand-800">{area.label}</span>
              <span className={`badge shrink-0 ${meta.badge}`}>
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Problemas declarados */}
      {issueCount > 0 && (
        <div className="mt-8">
          <h3 className="font-heading text-lg font-bold">
            Problemas declarados pelo vendedor
          </h3>
          <ul className="mt-4 space-y-4">
            {issues.map((issue) => (
              <li key={issue.id} className="rounded-card border border-brand-200 bg-brand-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                      {AREA_LABELS[issue.area]}
                    </p>
                    <h4 className="mt-0.5 font-heading text-base font-bold text-brand-900">
                      {issue.title}
                    </h4>
                  </div>
                  <span className={`badge ${SEVERITY_META[issue.severity].badge}`}>
                    {SEVERITY_META[issue.severity].label}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-brand-700">{issue.description}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {issue.repair_estimate_eur != null && (
                    <span className="badge bg-white text-brand-700 ring-1 ring-brand-200">
                      Estimativa de reparação: {formatPrice(issue.repair_estimate_eur)}
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
                </div>

                {issue.photo_url && (
                  <div className="relative mt-4 aspect-[16/10] max-w-md overflow-hidden rounded-lg border-2 border-accent-300">
                    <Image
                      src={issue.photo_url}
                      alt={`Fotografia do defeito: ${issue.title}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="object-cover"
                    />
                    <span className="badge absolute left-2 top-2 bg-accent-500 text-white">
                      Fotografia de defeito
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-brand-500">
            As estimativas de reparação são indicativas e da responsabilidade do stand vendedor.
            Recomendamos sempre uma inspeção independente antes da compra.
          </p>
        </div>
      )}
    </section>
  );
}
