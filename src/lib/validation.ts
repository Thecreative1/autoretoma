import { z } from "zod";
import { DISTRICTS } from "./constants";

const districtEnum = z.enum(DISTRICTS as unknown as [string, ...string[]], {
  errorMap: () => ({ message: "Escolha um distrito válido." }),
});

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9 +]{9,16}$/, "Indique um número de telefone válido.");

// ------------------------------------------------------------
// Registo de stand
// ------------------------------------------------------------
export const standRegistrationSchema = z.object({
  commercial_name: z.string().trim().min(2, "Indique o nome comercial.").max(120),
  company_name: z.string().trim().min(2, "Indique o nome da empresa.").max(160),
  nif: z.string().trim().regex(/^[0-9]{9}$/, "O NIF deve ter 9 dígitos."),
  contact_name: z.string().trim().min(2, "Indique o nome do responsável.").max(120),
  email: z.string().trim().email("Indique um email válido."),
  phone: phoneSchema,
  whatsapp: z
    .string()
    .trim()
    .regex(/^[0-9 +]{9,16}$/, "Indique um número válido.")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().min(5, "Indique a morada.").max(240),
  district: districtEnum,
  website: z.string().trim().url("Indique um URL válido (com https://).").optional().or(z.literal("")),
  activity_id: z.string().trim().max(60).optional().or(z.literal("")),
  password: z.string().min(8, "A palavra-passe deve ter pelo menos 8 caracteres.").max(72),
  terms: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar os termos e condições." }),
  }),
});

export type StandRegistrationInput = z.infer<typeof standRegistrationSchema>;

// ------------------------------------------------------------
// Dados do stand (edição no painel)
// ------------------------------------------------------------
export const standUpdateSchema = standRegistrationSchema.omit({
  password: true,
  terms: true,
  nif: true,
  email: true,
});

// ------------------------------------------------------------
// Anúncio — um schema por passo do formulário
// ------------------------------------------------------------
const currentYear = new Date().getFullYear();

/** Campo numérico opcional: aceita vazio e converte para undefined. */
const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(min).max(max).optional()
  );

/** Passo 1 — Identificação da viatura */
export const listingStep1Schema = z.object({
  brand_id: z.string().uuid({ message: "Escolha a marca." }),
  model_id: z.string().uuid({ message: "Escolha o modelo." }),
  version: z.string().trim().max(120).optional().or(z.literal("")),
  year: z.coerce
    .number()
    .int()
    .min(1950, "Ano inválido.")
    .max(currentYear + 1, "Ano inválido."),
  month: optionalInt(1, 12),
  mileage: z.coerce.number().int().min(0, "Indique os quilómetros.").max(2_000_000),
  fuel: z.enum(["gasolina", "gasoleo", "gpl", "hibrido", "eletrico"], {
    errorMap: () => ({ message: "Escolha o combustível." }),
  }),
  gearbox: z.enum(["manual", "automatica"], {
    errorMap: () => ({ message: "Escolha o tipo de caixa." }),
  }),
});

/** Passo 2 — Características técnicas */
export const listingStep2Schema = z.object({
  displacement_cc: optionalInt(1, 10000),
  power_hp: optionalInt(1, 2000),
  doors: optionalInt(2, 6),
  keys_count: optionalInt(0, 9),
  owners_count: optionalInt(1, 99),
  inspection_valid_until: z.string().trim().optional().or(z.literal("")),
  maintenance_history: z.string().trim().max(2000).optional().or(z.literal("")),
});

/** Passo 5 — Preço e localização */
export const listingStep5Schema = z.object({
  price: z.coerce.number().int().min(1, "Indique o preço."),
  district: districtEnum,
  municipality: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type ListingStep1Input = z.infer<typeof listingStep1Schema>;
export type ListingStep2Input = z.infer<typeof listingStep2Schema>;
export type ListingStep5Input = z.infer<typeof listingStep5Schema>;

// ------------------------------------------------------------
// Problema declarado
// ------------------------------------------------------------
export const issueSchema = z.object({
  area: z.enum([
    "motor_mecanica",
    "embraiagem_caixa",
    "travoes",
    "pneus",
    "interior",
    "carrocaria_pintura",
    "eletronica",
    "documentacao",
    "outros",
  ]),
  title: z.string().trim().min(3, "Indique um título.").max(120),
  description: z.string().trim().min(3, "Descreva o problema.").max(2000),
  severity: z.enum(["baixa", "media", "alta"]),
  repair_estimate_eur: optionalInt(0, 1_000_000),
  prevents_driving: z.boolean().default(false),
  photo_url: z.string().trim().optional().or(z.literal("")),
});

export type IssueInput = z.infer<typeof issueSchema>;

// ------------------------------------------------------------
// Lead (pedido de contacto)
// ------------------------------------------------------------
export const leadSchema = z.object({
  listing_id: z.string().uuid(),
  name: z.string().trim().min(2, "Indique o seu nome.").max(120),
  email: z.string().trim().email("Indique um email válido."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9 +]{9,16}$/, "Indique um número válido.")
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(5, "Escreva uma mensagem.").max(2000),
  rgpd_consent: z.literal(true, {
    errorMap: () => ({
      message: "É necessário consentir o tratamento dos dados para enviar o pedido.",
    }),
  }),
  // Honeypot anti-spam: deve chegar vazio
  website: z.string().max(0, "Pedido inválido.").optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;

// ------------------------------------------------------------
// Autenticação
// ------------------------------------------------------------
export const loginSchema = z.object({
  email: z.string().trim().email("Indique um email válido."),
  password: z.string().min(1, "Indique a palavra-passe."),
});

/** Converte um FormData em objeto plano para validação com zod. */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") obj[key] = value;
  }
  return obj;
}

/** Extrai o primeiro erro por campo, para mostrar nos formulários. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "geral");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
