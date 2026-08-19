import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { logout } from "@/app/(auth)/actions";
import { getOwnStand, getProfile, requireUser } from "@/lib/auth";
import { STAND_STATUS_META } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Painel do stand",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/painel", label: "Resumo" },
  { href: "/painel/anuncios", label: "Anúncios" },
  { href: "/painel/contactos", label: "Contactos recebidos" },
  { href: "/painel/stand", label: "Dados do stand" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const profile = await getProfile();
  if (profile?.role === "admin") redirect("/admin");

  const stand = await getOwnStand();

  // Conta autenticada sem stand associado: situação anómala (registo incompleto).
  if (!stand) {
    return (
      <div className="container-site max-w-xl py-16">
        <div className="card p-8 text-center">
          <h1 className="font-heading text-xl font-bold">Conta sem stand associado</h1>
          <p className="mt-3 text-sm text-brand-600">
            A sua conta não tem um stand associado. Contacte-nos para regularizar a situação.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/contactos" className="btn-primary">Contactar a AutoRetoma</Link>
            <form action={logout}>
              <button type="submit" className="btn-outline w-full">Terminar sessão</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const statusMeta = STAND_STATUS_META[stand.status];

  return (
    <div className="bg-gray-50">
      <div className="border-b border-brand-100 bg-white">
        <div className="container-site flex flex-wrap items-center justify-between gap-3 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              Painel do stand
            </p>
            <h1 className="font-heading text-xl font-extrabold">{stand.commercial_name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${statusMeta.badge}`}>{statusMeta.label}</span>
            <form action={logout}>
              <button type="submit" className="btn-outline px-4 py-2 text-sm">
                Terminar sessão
              </button>
            </form>
          </div>
        </div>
      </div>

      <DashboardNav items={NAV} />

      {stand.status !== "aprovado" && (
        <div className="container-site pt-6">
          <div
            role="status"
            className={`rounded-card p-4 text-sm leading-relaxed ${
              stand.status === "pendente"
                ? "bg-amber-50 text-amber-900"
                : "bg-red-50 text-red-900"
            }`}
          >
            {stand.status === "pendente" && (
              <>
                <strong>A aguardar verificação.</strong> A sua conta está a ser analisada
                pela equipa da AutoRetoma. Pode preparar anúncios como rascunho, mas só
                poderá enviá-los para aprovação depois de o stand ser aprovado.
              </>
            )}
            {stand.status === "suspenso" && (
              <>
                <strong>Conta suspensa.</strong> Os seus anúncios não estão visíveis ao
                público. {stand.admin_notes && <>Motivo: {stand.admin_notes}. </>}
                Contacte-nos para mais informações.
              </>
            )}
            {stand.status === "rejeitado" && (
              <>
                <strong>Registo rejeitado.</strong>{" "}
                {stand.admin_notes ? `Motivo: ${stand.admin_notes}.` : "Contacte-nos para mais informações."}
              </>
            )}
          </div>
        </div>
      )}

      <div className="container-site py-8">{children}</div>
    </div>
  );
}
