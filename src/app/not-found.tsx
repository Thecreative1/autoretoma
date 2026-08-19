import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-site max-w-lg py-20 text-center">
      <p className="font-heading text-5xl font-extrabold text-accent-500">404</p>
      <h1 className="mt-4 font-heading text-2xl font-extrabold tracking-tight">
        Página não encontrada
      </h1>
      <p className="mt-3 text-brand-600">
        A página que procura não existe ou o anúncio já não está disponível.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/carros" className="btn-primary">Ver carros</Link>
        <Link href="/" className="btn-outline">Voltar ao início</Link>
      </div>
    </div>
  );
}
