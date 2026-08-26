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

/**
 * Número em formato internacional para o wa.me, a partir do que o stand escreveu.
 * O formulário aceita "912345678", "+351 912 345 678" ou "00351912345678" — e o
 * WhatsApp mostra sempre o número com indicativo, por isso é isso que o stand copia.
 * Sem normalizar, prefixar 351 às cegas gerava "351351…" e um link morto.
 */
export function whatsappNumber(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (!digits.startsWith("351")) digits = `351${digits}`;
  // 351 + nove dígitos nacionais
  return digits.length === 12 ? digits : null;
}

/**
 * Preço arredondado para texto de apresentação: "6 mil euros" em vez de "6001 €".
 * Só arredonda para baixo e quando o valor está a menos de 100 € do milhar, para
 * nunca anunciar um tecto maior do que o real. Onde o número é uma regra que o
 * stand tem de cumprir, usa-se formatPrice, que não arredonda.
 */
export function formatPriceRounded(value: number): string {
  const milhares = Math.floor(value / 1000);
  if (milhares >= 1 && value - milhares * 1000 <= 100) {
    return `${milhares} mil euros`;
  }
  return formatPrice(value);
}

/**
 * Serializa um objeto para injeção segura num <script type="application/ld+json">.
 * O JSON.stringify não escapa `<`, `>` nem `&`, pelo que um texto controlado pelo
 * utilizador (descrição, nome do stand...) com `</script>` sairia do bloco e
 * executaria como HTML. Escapamos esses caracteres — e os separadores de linha
 * U+2028/U+2029, inválidos em JS — para as suas sequências \uXXXX. O parser de
 * JSON-LD descodifica-as de volta, por isso os dados lidos ficam idênticos.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\u003c")
    .replace(/>/g, "\u003e")
    .replace(/&/g, "\u0026")
    .replace(/\u2028/g, "\u2028")
    .replace(/\u2029/g, "\u2029");
}
