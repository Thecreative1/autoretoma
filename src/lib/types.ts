// Tipos que espelham o esquema da base de dados (supabase/migrations).

export type UserRole = "stand" | "admin";

export type StandStatus = "pendente" | "aprovado" | "suspenso" | "rejeitado";

export type ListingStatus =
  | "rascunho"
  | "em_analise"
  | "alteracoes_necessarias"
  | "publicado"
  | "reservado"
  | "vendido"
  | "rejeitado"
  | "arquivado";

export type FuelType = "gasolina" | "gasoleo" | "gpl" | "hibrido" | "eletrico";

export type GearboxType = "manual" | "automatica";

export type ConditionArea =
  | "motor_mecanica"
  | "embraiagem_caixa"
  | "travoes"
  | "pneus"
  | "interior"
  | "carrocaria_pintura"
  | "eletronica"
  | "documentacao"
  | "outros";

export type ConditionStatus =
  | "sem_problema"
  | "desgaste_normal"
  | "precisa_atencao"
  | "problema_declarado"
  | "nao_verificado";

export type IssueSeverity = "baixa" | "media" | "alta";

export type LeadStatus = "novo" | "contactado" | "fechado";

export type PhotoCategory =
  | "frontal"
  | "traseira"
  | "lateral_esquerda"
  | "lateral_direita"
  | "interior"
  | "conta_quilometros"
  | "motor"
  | "defeito"
  | "outra";

export interface Profile {
  id: string;
  role: UserRole;
  created_at: string;
}

export interface Stand {
  id: string;
  owner_id: string;
  slug: string;
  commercial_name: string;
  company_name: string;
  nif: string;
  contact_name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  address: string;
  district: string;
  website: string | null;
  logo_url: string | null;
  activity_id: string | null;
  status: StandStatus;
  admin_notes: string | null;
  is_demo: boolean;
  terms_accepted_at: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Model {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
}

export interface PlatformSettings {
  id: number;
  max_price_eur: number;
  min_photos: number;
  facet_min_listings: number;
  updated_at: string;
  updated_by: string | null;
}

export interface Listing {
  id: string;
  stand_id: string;
  brand_id: string;
  model_id: string;
  version: string | null;
  year: number;
  month: number | null;
  /** Nulo enquanto o anúncio é rascunho; obrigatório na submissão. */
  price: number | null;
  mileage: number;
  fuel: FuelType;
  displacement_cc: number | null;
  power_hp: number | null;
  gearbox: GearboxType;
  doors: number | null;
  /** Nulo enquanto o anúncio é rascunho; obrigatório na submissão. */
  district: string | null;
  municipality: string | null;
  inspection_valid_until: string | null;
  keys_count: number | null;
  maintenance_history: string | null;
  owners_count: number | null;
  description: string | null;
  status: ListingStatus;
  slug: string | null;
  featured: boolean;
  views_count: number;
  admin_feedback: string | null;
  submitted_at: string | null;
  published_at: string | null;
  sold_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingCondition {
  id: string;
  listing_id: string;
  area: ConditionArea;
  status: ConditionStatus;
}

export interface ListingIssue {
  id: string;
  listing_id: string;
  area: ConditionArea;
  title: string;
  description: string;
  severity: IssueSeverity;
  photo_url: string | null;
  repair_estimate_eur: number | null;
  prevents_driving: boolean;
  sort_order: number;
}

export interface ListingPhoto {
  id: string;
  listing_id: string;
  url: string;
  category: PhotoCategory;
  /** Legenda curta escrita pelo stand. Usada nas fotografias "Outra". */
  caption: string | null;
  is_defect: boolean;
  sort_order: number;
}

export interface Lead {
  id: string;
  listing_id: string;
  stand_id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  rgpd_consent: boolean;
  status: LeadStatus;
  created_at: string;
}

// Anúncio com relações, tal como devolvido pelas queries públicas.
// Só devolve anúncios já submetidos, onde preço e distrito são garantidos.
export interface ListingWithRelations extends Omit<Listing, "price" | "district"> {
  price: number;
  district: string;
  brand: Brand;
  model: Model;
  stand: Pick<
    Stand,
    | "id"
    | "slug"
    | "commercial_name"
    | "district"
    | "phone"
    | "whatsapp"
    | "email"
    | "logo_url"
    | "address"
    | "is_demo"
  >;
  photos: ListingPhoto[];
  conditions: ListingCondition[];
  issues: ListingIssue[];
}

export interface ListingCard {
  id: string;
  slug: string | null;
  version: string | null;
  year: number;
  price: number;
  mileage: number;
  fuel: FuelType;
  gearbox: GearboxType;
  district: string;
  municipality: string | null;
  status: ListingStatus;
  featured: boolean;
  inspection_valid_until: string | null;
  published_at: string | null;
  brand: Pick<Brand, "name" | "slug">;
  model: Pick<Model, "name" | "slug">;
  stand: Pick<Stand, "commercial_name" | "slug" | "is_demo">;
  photos: Pick<ListingPhoto, "url" | "is_defect" | "sort_order" | "category">[];
  issues: { id: string }[];
}
