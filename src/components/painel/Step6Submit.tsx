"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { submitForReview, type ActionState } from "@/app/painel/anuncios/actions";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending || disabled}>
      {pending ? "A enviar…" : "Enviar para aprovação"}
    </button>
  );
}

export function Step6Submit({
  listingId,
  blockers,
  standApproved,
}: {
  listingId: string;
  blockers: string[];
  standApproved: boolean;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(submitForReview, {
    ok: false,
  });

  const canSubmit = blockers.length === 0 && standApproved;

  return (
    <div className="space-y-5">
      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {state.message}
        </p>
      )}

      {!standApproved && (
        <p className="rounded-lg bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <strong>O seu stand ainda não está aprovado.</strong> Pode manter o anúncio como
          rascunho; assim que a conta for verificada, poderá enviá-lo para aprovação.
        </p>
      )}

      {blockers.length > 0 ? (
        <div className="rounded-card bg-amber-50 p-5">
          <h3 className="font-heading text-base font-bold text-amber-900">
            Falta completar antes de submeter
          </h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-amber-900">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ) : (
        standApproved && (
          <p className="rounded-card bg-green-50 p-5 text-sm leading-relaxed text-green-900">
            <strong>O anúncio está pronto para submissão.</strong> Depois de enviado, passa
            a &quot;em análise&quot; e é revisto pela equipa da AutoRetoma antes de ficar
            visível na pesquisa pública.
          </p>
        )
      )}

      <form action={formAction} className="flex items-center justify-between border-t border-brand-100 pt-5">
        <input type="hidden" name="listing_id" value={listingId} />
        <Link href={`/painel/anuncios/${listingId}?passo=5`} className="btn-outline">
          Voltar
        </Link>
        <SubmitButton disabled={!canSubmit} />
      </form>
    </div>
  );
}
