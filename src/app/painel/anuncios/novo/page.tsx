import Link from "next/link";
import { WizardSteps } from "@/components/painel/WizardSteps";
import { Step1Form } from "@/components/painel/Step1Form";
import { getBrands, getModels } from "@/lib/queries";

export default async function NewListingPage() {
  const [brands, models] = await Promise.all([getBrands(), getModels()]);

  return (
    <div className="max-w-3xl">
      <nav aria-label="Caminho" className="mb-4 text-sm text-brand-500">
        <Link href="/painel/anuncios" className="hover:text-accent-600">Anúncios</Link>
        <span aria-hidden="true" className="mx-1.5">/</span>
        <span className="text-brand-800">Novo anúncio</span>
      </nav>

      <h2 className="font-heading text-xl font-extrabold">Novo anúncio</h2>
      <p className="mt-1 text-sm text-brand-600">
        Passo 1 de 6 — Identificação da viatura. O anúncio é guardado como rascunho e pode
        ser retomado a qualquer momento.
      </p>

      <div className="mt-6">
        <WizardSteps current={1} />
      </div>

      <div className="card p-6">
        <Step1Form brands={brands} models={models} />
      </div>
    </div>
  );
}
