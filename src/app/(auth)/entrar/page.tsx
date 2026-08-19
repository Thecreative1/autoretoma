import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { getProfile, getSessionUser } from "@/lib/auth";
import { firstParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Aceda ao painel do seu stand na AutoRetoma.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getSessionUser();
  if (user) {
    const profile = await getProfile();
    redirect(profile?.role === "admin" ? "/admin" : "/painel");
  }

  const sp = await searchParams;
  const next = firstParam(sp.proximo) ?? "";

  return (
    <div className="container-site max-w-md py-12 lg:py-20">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">Entrar</h1>
      <p className="mt-2 text-brand-600">
        Área reservada a vendedores profissionais registados.
      </p>

      <div className="card mt-8 p-6">
        <LoginForm next={next} />
      </div>

      <p className="mt-6 text-center text-sm text-brand-600">
        Ainda não tem conta?{" "}
        <Link href="/registar" className="font-semibold text-accent-600 hover:text-accent-700">
          Registar o meu stand
        </Link>
      </p>
    </div>
  );
}
