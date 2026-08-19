import type {
  ConditionArea,
  ConditionStatus,
  FuelType,
  GearboxType,
  IssueSeverity,
  LeadStatus,
  ListingStatus,
  PhotoCategory,
  StandStatus,
} from "./types";

export const SITE_NAME = "AutoRetoma";
export const SITE_TAGLINE = "Carros baratos. Estado transparente. Diretos do stand.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const DISTRICTS = [
  "Aveiro",
  "Beja",
  "Braga",
  "Bragança",
  "Castelo Branco",
  "Coimbra",
  "Évora",
  "Faro",
  "Guarda",
  "Leiria",
  "Lisboa",
  "Portalegre",
  "Porto",
  "Santarém",
  "Setúbal",
  "Viana do Castelo",
  "Vila Real",
  "Viseu",
  "Açores",
  "Madeira",
] as const;

export const FUEL_LABELS: Record<FuelType, string> = {
  gasolina: "Gasolina",
  gasoleo: "Gasóleo",
  gpl: "GPL",
  hibrido: "Híbrido",
  eletrico: "Elétrico",
};

export const GEARBOX_LABELS: Record<GearboxType, string> = {
  manual: "Manual",
  automatica: "Automática",
};

export const CONDITION_AREAS: { value: ConditionArea; label: string }[] = [
  { value: "motor_mecanica", label: "Motor e mecânica" },
  { value: "embraiagem_caixa", label: "Embraiagem e caixa" },
  { value: "travoes", label: "Travões" },
  { value: "pneus", label: "Pneus" },
  { value: "interior", label: "Interior" },
  { value: "carrocaria_pintura", label: "Carroçaria e pintura" },
  { value: "eletronica", label: "Eletrónica" },
  { value: "documentacao", label: "Documentação" },
  { value: "outros", label: "Outros" },
];

export const AREA_LABELS = Object.fromEntries(
  CONDITION_AREAS.map((a) => [a.value, a.label])
) as Record<ConditionArea, string>;

export const CONDITION_STATUS_META: Record<
  ConditionStatus,
  { label: string; badge: string; dot: string }
> = {
  sem_problema: {
    label: "Sem problema conhecido",
    badge: "bg-green-100 text-green-800",
    dot: "bg-green-500",
  },
  desgaste_normal: {
    label: "Desgaste normal",
    badge: "bg-brand-100 text-brand-700",
    dot: "bg-brand-400",
  },
  precisa_atencao: {
    label: "Precisa de atenção",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  problema_declarado: {
    label: "Problema declarado",
    badge: "bg-red-100 text-red-800",
    dot: "bg-red-500",
  },
  nao_verificado: {
    label: "Não verificado",
    badge: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
};

export const SEVERITY_META: Record<IssueSeverity, { label: string; badge: string }> = {
  baixa: { label: "Gravidade baixa", badge: "bg-amber-50 text-amber-700 border border-amber-200" },
  media: { label: "Gravidade média", badge: "bg-amber-100 text-amber-800" },
  alta: { label: "Gravidade alta", badge: "bg-red-100 text-red-800" },
};

export const LISTING_STATUS_META: Record<ListingStatus, { label: string; badge: string }> = {
  rascunho: { label: "Rascunho", badge: "bg-gray-100 text-gray-700" },
  em_analise: { label: "Em análise", badge: "bg-blue-100 text-blue-800" },
  alteracoes_necessarias: { label: "Alterações necessárias", badge: "bg-amber-100 text-amber-800" },
  publicado: { label: "Disponível", badge: "bg-green-100 text-green-800" },
  reservado: { label: "Reservado", badge: "bg-amber-100 text-amber-800" },
  vendido: { label: "Vendido", badge: "bg-brand-900 text-white" },
  rejeitado: { label: "Rejeitado", badge: "bg-red-100 text-red-800" },
  arquivado: { label: "Arquivado", badge: "bg-gray-100 text-gray-500" },
};

export const STAND_STATUS_META: Record<StandStatus, { label: string; badge: string }> = {
  pendente: { label: "A aguardar verificação", badge: "bg-amber-100 text-amber-800" },
  aprovado: { label: "Aprovado", badge: "bg-green-100 text-green-800" },
  suspenso: { label: "Suspenso", badge: "bg-red-100 text-red-800" },
  rejeitado: { label: "Rejeitado", badge: "bg-red-100 text-red-800" },
};

export const LEAD_STATUS_META: Record<LeadStatus, { label: string; badge: string }> = {
  novo: { label: "Novo", badge: "bg-accent-100 text-accent-700" },
  contactado: { label: "Contactado", badge: "bg-blue-100 text-blue-800" },
  fechado: { label: "Fechado", badge: "bg-gray-100 text-gray-600" },
};

export const PHOTO_CATEGORIES: {
  value: PhotoCategory;
  label: string;
  required: boolean;
}[] = [
  { value: "frontal", label: "Frontal", required: true },
  { value: "traseira", label: "Traseira", required: true },
  { value: "lateral_esquerda", label: "Lateral esquerda", required: true },
  { value: "lateral_direita", label: "Lateral direita", required: true },
  { value: "interior", label: "Interior", required: true },
  { value: "conta_quilometros", label: "Quadrante com quilómetros", required: true },
  { value: "motor", label: "Motor", required: true },
  { value: "defeito", label: "Fotografia de defeito", required: false },
  { value: "outra", label: "Outra", required: false },
];

export const PHOTO_CATEGORY_LABELS = Object.fromEntries(
  PHOTO_CATEGORIES.map((c) => [c.value, c.label])
) as Record<PhotoCategory, string>;

export const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "preco_asc", label: "Preço mais baixo" },
  { value: "preco_desc", label: "Preço mais alto" },
  { value: "km_asc", label: "Menos quilómetros" },
  { value: "ano_desc", label: "Ano mais recente" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const PAGE_SIZE = 12;

// Estados de anúncio visíveis ao público
export const PUBLIC_LISTING_STATUSES: ListingStatus[] = ["publicado", "reservado", "vendido"];
