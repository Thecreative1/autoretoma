import { createClient } from "@/lib/supabase/server";
import { BrandManager } from "./BrandManager";
import type { Brand } from "@/lib/types";

interface BrandRow extends Brand {
  models: { id: string; name: string; slug: string }[];
  listings: { id: string }[];
}

export default async function AdminBrandsPage() {
  const supabase = await createClient();

  const [{ data: brands }, { data: modelUsage }] = await Promise.all([
    supabase.from("brands").select("*, models(id, name, slug), listings(id)").order("name"),
    supabase.from("listings").select("model_id"),
  ]);

  const usedModelIds = new Set((modelUsage ?? []).map((l) => l.model_id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg font-bold">Marcas e modelos</h2>
        <p className="mt-1 text-sm text-brand-600">
          Estas listas alimentam o formulário de publicação e os filtros de pesquisa.
          Modelos já utilizados em anúncios não podem ser removidos.
        </p>
      </div>

      <BrandManager
        brands={(brands ?? []) as unknown as BrandRow[]}
        usedModelIds={[...usedModelIds]}
      />
    </div>
  );
}
