// Utilitários partilhados (cliente e servidor).

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Remove acentos e gera um slug seguro para URLs. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const eur = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return eur.format(value);
}

const num = new Intl.NumberFormat("pt-PT");

export function formatMileage(km: number): string {
  return `${num.format(km)} km`;
}

export function formatNumber(value: number): string {
  return num.format(value);
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatMonthYear(year: number, month: number | null): string {
  if (!month) return String(year);
  return `${String(month).padStart(2, "0")}/${year}`;
}

export function isInspectionValid(date: string | null): boolean {
  if (!date) return false;
  return new Date(date) >= new Date(new Date().toDateString());
}

/** Data relativa simples em português (ex.: "há 3 dias"). */
export function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return minutes <= 1 ? "há minutos" : `há ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "há 1 hora" : `há ${hours} horas`;
  const days = Math.floor(hours / 24);
  if (days < 31) return days === 1 ? "há 1 dia" : `há ${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? "há 1 mês" : `há ${months} meses`;
}

/** Constrói o slug público de um anúncio: marca-modelo-ano-local-preco */
export function buildListingSlug(parts: {
  brand: string;
  model: string;
  year: number;
  municipality?: string | null;
  district: string;
  price: number;
}): string {
  const location = parts.municipality?.trim() || parts.district;
  return [
    slugify(parts.brand),
    slugify(parts.model),
    String(parts.year),
    slugify(location),
    String(parts.price),
  ]
    .filter(Boolean)
    .join("-");
}

/** Converte searchParams (string | string[] | undefined) num valor único. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

export function toInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}
