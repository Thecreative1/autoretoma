import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "./RegisterForm";
import { getProfile, getSessionUser } from "@/lib/auth";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Registar o meu stand",
  description:
    "Registe o seu stand na AutoRetoma e publique retomas e carros de baixo valor com o estado declarado.",
  alternates: { canonical: `${SITE_URL}/registar` },
};

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) {
    const profile = await getProfile();
    redirect(profile?.role === "admin" ? "/admin" : "/painel");
  }

  return (
    <div className="container-site max-w-2xl py-10 lg:py-16">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
        Registar o meu stand
      </h1>
      <p className="mt-3 text-brand-600">
        O registo está reservado a vendedores profissionais. Depois de submeter, a conta
        fica <strong>a aguardar verificação</strong> até aprovação da nossa equipa.
      </p>

      <div className="card mt-8 p-6">
        <RegisterForm />
      </div>

      <p className="mt-6 text-center text-sm text-brand-600">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-accent-600 hover:text-accent-700">
          Entrar
        </Link>
      </p>
    </div>
  );
}
