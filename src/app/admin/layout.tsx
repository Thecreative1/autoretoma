import type { Metadata } from "next";
import Link from "next/link";
import { DashboardNav } from "@/components/DashboardNav";
import { logout } from "@/app/(auth)/actions";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Estatísticas" },
  { href: "/admin/stands", label: "Stands" },
  { href: "/admin/anuncios", label: "Anúncios" },
  { href: "/admin/leads", label: "Contactos" },
  { href: "/admin/marcas", label: "Marcas e modelos" },
  { href: "/admin/definicoes", label: "Definições" },
  { href: "/admin/registo", label: "Registo de ações" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="bg-gray-50">
      <div className="border-b border-brand-100 bg-brand-950 text-white">
        <div className="container-site flex flex-wrap items-center justify-between gap-3 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-400">
              AutoRetoma
            </p>
            <h1 className="font-heading text-xl font-extrabold">Administração</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-brand-200 hover:text-white">
              Ver site
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="btn border border-brand-700 bg-transparent px-4 py-2 text-sm text-white hover:bg-brand-900"
              >
                Terminar sessão
              </button>
            </form>
          </div>
        </div>
      </div>

      <DashboardNav items={NAV} />

      <div className="container-site py-8">{children}</div>
    </div>
  );
}
