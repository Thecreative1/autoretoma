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
export const SITE_EMAIL = "contacto@autoretoma.pt";

/**
 * Identificação do prestador do serviço.
 *
 * BLOQUEANTE: o artigo 10.º do Decreto-Lei n.º 7/2004 (comércio eletrónico) obriga
 * quem presta um serviço da sociedade da informação a disponibilizar, de forma
 * permanente e de acesso fácil, o nome ou denominação social, o número de
 * identificação fiscal e o endereço da sede.
 *
 * Enquanto estes campos estiverem a null, as páginas legais omitem o bloco de
 * identificação em vez de mostrarem texto por preencher. Preencher antes de
 * aprovar o primeiro stand.
 */
export const OPERATOR: {
  legalName: string | null;
  taxId: string | null;
  address: string | null;
} = {
  legalName: null, // ex.: "AutoRetoma, Unipessoal Lda."
  taxId: null, // ex.: "PT512345678"
  address: null, // ex.: "Rua Exemplo, 00, 4760-000 Vila Nova de Famalicão"
};

/** Verdadeiro quando a identificação legal já está completa. */
export const OPERATOR_IDENTIFIED =
  OPERATOR.legalName !== null && OPERATOR.taxId !== null && OPERATOR.address !== null;

/** Data da última revisão dos documentos legais. Atualizar sempre que o texto mudar. */
export const LEGAL_UPDATED = "24 de agosto de 2026";

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

/** Categorias em que a legenda do stand acrescenta informação ao comprador. */
export const PHOTO_CAPTION_CATEGORIES: PhotoCategory[] = ["outra"];

export const PHOTO_CAPTION_MAX = 80;

/** O que o comprador lê por baixo da fotografia: a legenda do stand, se existir. */
export function photoLabel(photo: {
  category: PhotoCategory;
  caption?: string | null;
}): string {
  return photo.caption?.trim() || PHOTO_CATEGORY_LABELS[photo.category];
}

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

/**
 * Nem todos os problemas se fotografam: uma embraiagem gasta está dentro da
 * campânula, um consumo de óleo não se vê. Para essas áreas não faz sentido
 * exigir — nem sugerir — fotografia do defeito; o que dá confiança ao comprador
 * é o diagnóstico ou o orçamento da oficina.
 */
export const AREA_PHOTO_EXPECTED: Record<ConditionArea, boolean> = {
  carrocaria_pintura: true,
  pneus: true,
  interior: true,
  documentacao: true,
  eletronica: false,
  travoes: false,
  motor_mecanica: false,
  embraiagem_caixa: false,
  outros: false,
};

export const AREA_PHOTO_HINT: Record<ConditionArea, string> = {
  carrocaria_pintura:
    "Fotografe a zona afetada. Uma amolgadela vista de perto evita discussões sobre o tamanho.",
  pneus: "Fotografe o piso do pneu, onde se vê o desgaste.",
  interior: "Fotografe a zona danificada.",
  documentacao: "Fotografe o documento em causa. Pode tapar dados pessoais.",
  eletronica:
    "Se houver luz acesa no painel, fotografe o quadrante. Caso contrário, descreva bem o sintoma.",
  travoes:
    "Se o desgaste for visível, fotografe. Caso contrário, junte o orçamento ou o diagnóstico da oficina.",
  motor_mecanica:
    "Fugas e danos visíveis fotografam-se. Avarias internas não — nesses casos vale mais juntar o diagnóstico da oficina.",
  embraiagem_caixa:
    "Este tipo de avaria não se fotografa. Se tiver diagnóstico ou orçamento de oficina, junte-o; senão, descreva o sintoma com detalhe.",
  outros: "Fotografe o que for visível, ou junte documentação relevante.",
};
