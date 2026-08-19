"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/carros", label: "Ver carros" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/para-stands", label: "Para stands" },
];

export function MobileMenu({
  isAuthenticated,
  isAdmin,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-200 text-brand-900"
        aria-expanded={open}
        aria-controls="menu-movel"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div
          id="menu-movel"
          className="fixed inset-x-0 top-16 z-50 border-t border-brand-100 bg-white shadow-lg"
        >
          <nav aria-label="Navegação principal (telemóvel)" className="container-site py-4">
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-brand-800 hover:bg-brand-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2 border-t border-brand-100 pt-4">
              {isAuthenticated ? (
                <>
                  <Link href={isAdmin ? "/admin" : "/painel"} className="btn-outline w-full">
                    {isAdmin ? "Administração" : "O meu painel"}
                  </Link>
                  <Link href="/painel/anuncios/novo" className="btn-primary w-full">
                    Publicar retoma
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/entrar" className="btn-outline w-full">
                    Entrar
                  </Link>
                  <Link href="/registar" className="btn-primary w-full">
                    Publicar retoma
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
