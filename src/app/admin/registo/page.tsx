import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { formatDate, timeAgo } from "@/lib/utils";

interface AuditRow {
  id: number;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  stand_aprovado: "Stand aprovado",
  stand_rejeitado: "Stand rejeitado",
  stand_suspenso: "Stand suspenso",
  stand_pendente: "Stand marcado como pendente",
  anuncio_aprovar: "Anúncio aprovado e publicado",
  anuncio_alteracoes: "Alterações pedidas ao anúncio",
  anuncio_rejeitar: "Anúncio rejeitado",
  anuncio_arquivar: "Anúncio arquivado",
  anuncio_destacado: "Anúncio destacado",
  anuncio_sem_destaque: "Destaque removido",
  definicoes_atualizadas: "Definições atualizadas",
  marca_criada: "Marca criada",
  modelo_criado: "Modelo criado",
  modelo_removido: "Modelo removido",
  seed: "Dados de demonstração carregados",
};

export default async function AdminAuditPage() {
  await requireAdmin();

  // O log é lido com service role para juntar o email do administrador.
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as AuditRow[];

  const adminIds = [...new Set(rows.map((r) => r.admin_id).filter(Boolean))] as string[];
  const emails = new Map<string, string>();
  for (const id of adminIds) {
    const { data: userData } = await admin.auth.admin.getUserById(id);
    if (userData.user?.email) emails.set(id, userData.user.email);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg font-bold">Registo de ações administrativas</h2>
        <p className="mt-1 text-sm text-brand-600">
          Aprovações, rejeições, suspensões e alterações às definições. As 200 entradas
          mais recentes.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-brand-600">Ainda não existem ações registadas.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-5">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-brand-200 text-left text-xs uppercase tracking-wide text-brand-500">
                <th className="pb-2 pr-4 font-semibold">Quando</th>
                <th className="pb-2 pr-4 font-semibold">Administrador</th>
                <th className="pb-2 pr-4 font-semibold">Ação</th>
                <th className="pb-2 pr-4 font-semibold">Entidade</th>
                <th className="pb-2 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="py-2.5 pr-4 whitespace-nowrap text-brand-600" title={formatDate(row.created_at)}>
                    {timeAgo(row.created_at)}
                  </td>
                  <td className="py-2.5 pr-4 text-brand-600">
                    {row.admin_id ? emails.get(row.admin_id) ?? "—" : "sistema"}
                  </td>
                  <td className="py-2.5 pr-4 font-medium">
                    {ACTION_LABELS[row.action] ?? row.action}
                  </td>
                  <td className="py-2.5 pr-4 text-brand-600">
                    {row.entity_type}
                    {row.entity_id && (
                      <span className="ml-1 text-xs text-brand-400">
                        {row.entity_id.slice(0, 8)}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-xs text-brand-600">
                    {row.details
                      ? Object.entries(row.details)
                          .filter(([, v]) => v !== null && v !== "")
                          .map(([k, v]) => `${k}: ${String(v)}`)
                          .join(" · ") || "—"
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
