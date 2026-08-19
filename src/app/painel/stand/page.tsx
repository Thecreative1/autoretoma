import { StandForm } from "./StandForm";
import { LogoUploader } from "./LogoUploader";
import { getOwnStand, requireUser } from "@/lib/auth";
import { STAND_STATUS_META } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function StandDataPage() {
  const user = await requireUser();
  const stand = await getOwnStand();
  if (!stand) return null;

  const meta = STAND_STATUS_META[stand.status];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-heading text-lg font-bold">Dados do stand</h2>
        <p className="mt-1 text-sm text-brand-600">
          Estes dados aparecem nos seus anúncios e são usados pelos compradores para o
          contactar.
        </p>
      </div>

      <div className="card p-5">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-brand-500">Estado da conta</dt>
            <dd className="mt-1">
              <span className={`badge ${meta.badge}`}>{meta.label}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-brand-500">NIF</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-900">{stand.nif}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-brand-500">Registado em</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-900">
              {formatDate(stand.created_at)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-brand-500">
          O NIF e o email de acesso ({stand.email}) não podem ser alterados no painel.
          Para os corrigir, contacte a AutoRetoma.
        </p>
      </div>

      <div className="card p-6">
        <h3 className="mb-5 font-heading text-base font-bold">Logótipo</h3>
        <LogoUploader userId={user.id} currentLogo={stand.logo_url} />
      </div>

      <div className="card p-6">
        <h3 className="mb-5 font-heading text-base font-bold">Dados e contactos</h3>
        <StandForm stand={stand} />
      </div>
    </div>
  );
}
