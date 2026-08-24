import Link from "next/link";
import { OPERATOR, OPERATOR_IDENTIFIED } from "@/lib/constants";
import { Logo } from "./Logo";

const LEGAL = [
  { href: "/termos-e-condicoes", label: "Termos e condições" },
  { href: "/politica-de-privacidade", label: "Política de privacidade" },
  { href: "/politica-de-cookies", label: "Política de cookies" },
  { href: "/vendedores-profissionais", label: "Vendedores profissionais" },
  { href: "/resolucao-de-litigios", label: "Resolução de litígios" },
  { href: "/livro-de-reclamacoes", label: "Livro de Reclamações" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-brand-950 text-brand-100">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="light" />
          <p className="mt-3 max-w-xs text-sm text-brand-200">
            Carros baratos. Estado transparente. Diretos do stand.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-brand-300">
            A AutoRetoma é uma plataforma de divulgação e contacto. Não é proprietária
            nem vendedora dos veículos anunciados; o negócio é celebrado diretamente
            com o stand vendedor.
          </p>
        </div>

        <nav aria-label="Navegação">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-white">
            Navegação
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/carros" className="hover:text-accent-400">Ver carros</Link></li>
            <li><Link href="/como-funciona" className="hover:text-accent-400">Como funciona</Link></li>
            <li><Link href="/para-stands" className="hover:text-accent-400">Para stands</Link></li>
            <li><Link href="/registar" className="hover:text-accent-400">Registar o meu stand</Link></li>
            <li><Link href="/entrar" className="hover:text-accent-400">Entrar</Link></li>
          </ul>
        </nav>

        <nav aria-label="Informação legal">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-white">
            Informação legal
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LEGAL.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-accent-400">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-white">
            Contactos
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/contactos" className="hover:text-accent-400">Página de contactos</Link></li>
            <li>
              <a href="mailto:contacto@autoretoma.pt" className="hover:text-accent-400">
                contacto@autoretoma.pt
              </a>
            </li>
          </ul>
          <p className="mt-4 rounded-lg bg-brand-900 p-3 text-xs leading-relaxed text-brand-200">
            Os bens usados vendidos por um profissional a um consumidor têm garantia
            legal. Consulte a página de{" "}
            <Link href="/vendedores-profissionais" className="underline hover:text-accent-400">
              vendedores profissionais
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="border-t border-brand-900">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-brand-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} AutoRetoma. Todos os direitos reservados.
            {OPERATOR_IDENTIFIED && (
              <>
                {" "}
                {OPERATOR.legalName} · NIF {OPERATOR.taxId}
              </>
            )}
          </p>
          <p>
            A AutoRetoma divulga anúncios de vendedores profissionais e não é parte no
            contrato de compra e venda.
          </p>
        </div>
      </div>
    </footer>
  );
}
