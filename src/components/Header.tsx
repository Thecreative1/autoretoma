import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { getProfile, getSessionUser } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/carros", label: "Ver carros" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/para-stands", label: "Para stands" },
];

export async function Header() {
  const user = await getSessionUser();
  const profile = user ? await getProfile() : null;
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Navegação principal" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-brand-700 transition-colors hover:text-accent-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link href={isAdmin ? "/admin" : "/painel"} className="btn-outline">
                {isAdmin ? "Administração" : "O meu painel"}
              </Link>
              <Link href="/painel/anuncios/novo" className="btn-primary">
                Publicar retoma
              </Link>
            </>
          ) : (
            <>
              <Link href="/entrar" className="btn-outline">
                Entrar
              </Link>
              <Link href="/registar" className="btn-primary">
                Publicar retoma
              </Link>
            </>
          )}
        </div>

        {/* Telemóvel: botão de destaque + menu simples */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/carros" className="btn-primary px-4 py-2 text-sm">
            Ver carros
          </Link>
          <MobileMenu isAuthenticated={!!user} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
