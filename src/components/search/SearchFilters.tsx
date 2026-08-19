"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DISTRICTS, FUEL_LABELS, GEARBOX_LABELS } from "@/lib/constants";
import type { Brand, Model } from "@/lib/types";

interface Props {
  brands: Brand[];
  models: Model[];
  maxPrice: number;
}

/**
 * Filtros da pesquisa. Em computador ficam na coluna lateral;
 * em telemóvel abrem num painel sobreposto.
 */
export function SearchFilters({ brands, models, maxPrice }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const currentBrand = params.get("marca") ?? "";
  const brandId = brands.find((b) => b.slug === currentBrand)?.id;
  const availableModels = brandId ? models.filter((m) => m.brand_id === brandId) : [];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function submit(formData: FormData) {
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    const ordenar = params.get("ordenar");
    if (ordenar) next.set("ordenar", ordenar);

    for (const [key, value] of formData.entries()) {
      const v = String(value).trim();
      if (v) next.set(key, v);
    }
    next.delete("pagina");
    setOpen(false);
    router.push(`/carros?${next.toString()}`);
  }

  function clearAll() {
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    setOpen(false);
    router.push(next.toString() ? `/carros?${next.toString()}` : "/carros");
  }

  const activeCount = [...params.keys()].filter(
    (k) => !["q", "ordenar", "pagina"].includes(k)
  ).length;

  const form = (
    <form action={submit} className="space-y-5">
      <div>
        <label htmlFor="marca" className="label">Marca</label>
        <select
          id="marca"
          name="marca"
          defaultValue={currentBrand}
          className="input"
          onChange={(e) => {
            // Ao mudar de marca, o modelo escolhido deixa de fazer sentido.
            const next = new URLSearchParams(params.toString());
            if (e.target.value) next.set("marca", e.target.value);
            else next.delete("marca");
            next.delete("modelo");
            next.delete("pagina");
            router.replace(`/carros?${next.toString()}`);
          }}
        >
          <option value="">Todas as marcas</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>
      </div>

      {availableModels.length > 0 && (
        <div>
          <label htmlFor="modelo" className="label">Modelo</label>
          <select id="modelo" name="modelo" defaultValue={params.get("modelo") ?? ""} className="input">
            <option value="">Todos os modelos</option>
            {availableModels.map((m) => (
              <option key={m.id} value={m.slug}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      <fieldset>
        <legend className="label">Preço (€)</legend>
        <div className="flex items-center gap-2">
          <input
            type="number" name="preco_min" min={0} max={maxPrice} placeholder="Mín."
            defaultValue={params.get("preco_min") ?? ""} className="input" aria-label="Preço mínimo"
          />
          <span aria-hidden="true" className="text-brand-400">–</span>
          <input
            type="number" name="preco_max" min={0} max={maxPrice} placeholder={String(maxPrice)}
            defaultValue={params.get("preco_max") ?? ""} className="input" aria-label="Preço máximo"
          />
        </div>
        <p className="mt-1.5 text-xs text-brand-500">
          Limite atual da plataforma: {maxPrice.toLocaleString("pt-PT")} €
        </p>
      </fieldset>

      <fieldset>
        <legend className="label">Ano</legend>
        <div className="flex items-center gap-2">
          <input
            type="number" name="ano_min" min={1950} max={new Date().getFullYear() + 1} placeholder="De"
            defaultValue={params.get("ano_min") ?? ""} className="input" aria-label="Ano mínimo"
          />
          <span aria-hidden="true" className="text-brand-400">–</span>
          <input
            type="number" name="ano_max" min={1950} max={new Date().getFullYear() + 1} placeholder="Até"
            defaultValue={params.get("ano_max") ?? ""} className="input" aria-label="Ano máximo"
          />
        </div>
      </fieldset>

      <div>
        <label htmlFor="km_max" className="label">Quilómetros até</label>
        <select id="km_max" name="km_max" defaultValue={params.get("km_max") ?? ""} className="input">
          <option value="">Sem limite</option>
          {[50000, 100000, 150000, 200000, 250000, 300000].map((km) => (
            <option key={km} value={km}>{km.toLocaleString("pt-PT")} km</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="combustivel" className="label">Combustível</label>
        <select id="combustivel" name="combustivel" defaultValue={params.get("combustivel") ?? ""} className="input">
          <option value="">Todos</option>
          {Object.entries(FUEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="caixa" className="label">Caixa</label>
        <select id="caixa" name="caixa" defaultValue={params.get("caixa") ?? ""} className="input">
          <option value="">Todas</option>
          {Object.entries(GEARBOX_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="distrito" className="label">Distrito</label>
        <select id="distrito" name="distrito" defaultValue={params.get("distrito") ?? ""} className="input">
          <option value="">Todo o país</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="estado" className="label">Estado do veículo</label>
        <select id="estado" name="estado" defaultValue={params.get("estado") ?? ""} className="input">
          <option value="">Todos</option>
          <option value="disponivel">Disponível</option>
          <option value="reservado">Reservado</option>
          <option value="vendido">Vendido</option>
        </select>
      </div>

      <div className="space-y-3 border-t border-brand-100 pt-4">
        <label className="flex items-start gap-2.5 text-sm text-brand-700">
          <input
            type="checkbox" name="inspecao" value="1" defaultChecked={params.get("inspecao") === "1"}
            className="mt-0.5 h-4 w-4 rounded border-brand-300 text-accent-500 focus:ring-accent-500"
          />
          <span>Apenas com inspeção válida</span>
        </label>
        <label className="flex items-start gap-2.5 text-sm text-brand-700">
          <input
            type="checkbox" name="sem_graves" value="1" defaultChecked={params.get("sem_graves") === "1"}
            className="mt-0.5 h-4 w-4 rounded border-brand-300 text-accent-500 focus:ring-accent-500"
          />
          <span>Apenas carros sem problemas mecânicos graves</span>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1">Aplicar filtros</button>
        {activeCount > 0 && (
          <button type="button" onClick={clearAll} className="btn-outline">Limpar</button>
        )}
      </div>
    </form>
  );

  return (
    <>
      {/* Telemóvel: botão que abre o painel */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-outline w-full lg:hidden"
        aria-expanded={open}
      >
        Filtros{activeCount > 0 && ` (${activeCount})`}
      </button>

      {/* Computador: coluna lateral */}
      <div className="hidden lg:block">
        <div className="card p-5">
          <h2 className="mb-4 font-heading text-lg font-bold">Filtros</h2>
          {form}
        </div>
      </div>

      {/* Telemóvel: painel sobreposto */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div
            className="absolute inset-0 bg-brand-950/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 top-16 overflow-y-auto rounded-t-2xl bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3">
              <h2 className="font-heading text-lg font-bold">Filtros</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-200"
                aria-label="Fechar filtros"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="p-4 pb-24">{form}</div>
          </div>
        </div>
      )}
    </>
  );
}
