import { getSettings } from "@/lib/queries";
import { SettingsForm } from "./SettingsForm";
import { formatDate } from "@/lib/utils";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-heading text-lg font-bold">Definições da plataforma</h2>
        <p className="mt-1 text-sm text-brand-600">
          Estes valores controlam os limites aplicados aos anúncios e o comportamento das
          páginas públicas.
        </p>
      </div>

      <div className="card p-6">
        <SettingsForm settings={settings} />
      </div>

      <p className="text-xs text-brand-500">
        Última alteração: {formatDate(settings.updated_at)}.
      </p>
    </div>
  );
}
