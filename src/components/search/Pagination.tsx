import Link from "next/link";

export function Pagination({
  page,
  pageCount,
  params,
}: {
  page: number;
  pageCount: number;
  params: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  function href(target: number) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== "pagina") next.set(key, value);
    }
    if (target > 1) next.set("pagina", String(target));
    const qs = next.toString();
    return qs ? `/carros?${qs}` : "/carros";
  }

  // Janela de páginas à volta da atual
  const pages: number[] = [];
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const end = Math.min(pageCount, Math.max(page + 2, 5));
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={href(page - 1)} className="btn-outline px-3 py-2" rel="prev">
          Anterior
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={
            p === page
              ? "btn bg-brand-900 px-4 py-2 text-white"
              : "btn-outline px-4 py-2"
          }
        >
          {p}
        </Link>
      ))}
      {page < pageCount && (
        <Link href={href(page + 1)} className="btn-outline px-3 py-2" rel="next">
          Seguinte
        </Link>
      )}
    </nav>
  );
}
