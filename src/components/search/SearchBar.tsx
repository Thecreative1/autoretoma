"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();

  function search(formData: FormData) {
    const next = new URLSearchParams(params.toString());
    const q = String(formData.get("q") ?? "").trim();
    if (q) next.set("q", q);
    else next.delete("q");
    next.delete("pagina");
    router.push(`/carros?${next.toString()}`);
  }

  function changeSort(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("ordenar", value);
    else next.delete("ordenar");
    next.delete("pagina");
    router.push(`/carros?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <form action={search} className="flex flex-1 gap-2" role="search">
        <label htmlFor="pesquisa" className="sr-only">
          Pesquisar por marca, modelo ou versão
        </label>
        <input
          id="pesquisa"
          type="search"
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="Pesquisar marca, modelo ou versão…"
          className="input"
        />
        <button type="submit" className="btn-secondary shrink-0">
          Pesquisar
        </button>
      </form>

      <div className="shrink-0">
        <label htmlFor="ordenar" className="sr-only">Ordenar resultados</label>
        <select
          id="ordenar"
          className="input sm:w-56"
          defaultValue={params.get("ordenar") ?? "recentes"}
          onChange={(e) => changeSort(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
