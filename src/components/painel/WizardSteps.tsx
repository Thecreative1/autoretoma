import Link from "next/link";
import { cn } from "@/lib/utils";

export const WIZARD_STEPS = [
  { n: 1, label: "Identificação" },
  { n: 2, label: "Características" },
  { n: 3, label: "Estado e problemas" },
  { n: 4, label: "Fotografias" },
  { n: 5, label: "Preço e localização" },
  { n: 6, label: "Pré-visualização" },
] as const;

export function WizardSteps({
  current,
  listingId,
}: {
  current: number;
  listingId?: string;
}) {
  return (
    <nav aria-label="Passos da publicação" className="mb-8">
      <ol className="flex flex-wrap gap-2">
        {WIZARD_STEPS.map((step) => {
          const done = step.n < current;
          const active = step.n === current;
          const content = (
            <span
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
                active
                  ? "border-accent-500 bg-accent-50 text-accent-700"
                  : done
                    ? "border-brand-200 bg-white text-brand-700 hover:border-brand-400"
                    : "border-brand-100 bg-white text-brand-400"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold",
                  active
                    ? "bg-accent-500 text-white"
                    : done
                      ? "bg-brand-900 text-white"
                      : "bg-brand-100 text-brand-500"
                )}
              >
                {step.n}
              </span>
              {step.label}
            </span>
          );

          return (
            <li key={step.n} aria-current={active ? "step" : undefined}>
              {listingId && step.n !== current ? (
                <Link href={`/painel/anuncios/${listingId}?passo=${step.n}`}>{content}</Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
