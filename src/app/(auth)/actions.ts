"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fieldErrors, loginSchema, standRegistrationSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export interface AuthState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, message: "Email ou palavra-passe incorretos." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let destination = "/painel";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "admin") destination = "/admin";
  }

  const next = String(formData.get("proximo") ?? "");
  if (next.startsWith("/painel") || next.startsWith("/admin")) destination = next;

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function registerStand(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = standRegistrationSchema.safeParse({
    commercial_name: String(formData.get("commercial_name") ?? ""),
    company_name: String(formData.get("company_name") ?? ""),
    nif: String(formData.get("nif") ?? ""),
    contact_name: String(formData.get("contact_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    address: String(formData.get("address") ?? ""),
    district: String(formData.get("district") ?? ""),
    website: String(formData.get("website") ?? ""),
    activity_id: String(formData.get("activity_id") ?? ""),
    password: String(formData.get("password") ?? ""),
    terms: formData.get("terms") === "on",
  });

  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const input = parsed.data;

  const admin = createAdminClient();

  // O NIF é único: avisar antes de criar o utilizador.
  const { data: existingNif } = await admin
    .from("stands")
    .select("id")
    .eq("nif", input.nif)
    .maybeSingle();
  if (existingNif) {
    return { ok: false, errors: { nif: "Já existe um stand registado com este NIF." } };
  }

  const supabase = await createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });

  if (signUpError || !signUpData.user) {
    const duplicate = signUpError?.message?.toLowerCase().includes("already");
    return {
      ok: false,
      errors: duplicate
        ? { email: "Já existe uma conta com este email. Inicie sessão." }
        : undefined,
      message: duplicate
        ? undefined
        : "Não foi possível concluir o registo. Verifique os dados e tente novamente.",
    };
  }

  // Slug único a partir do nome comercial
  const base = slugify(input.commercial_name) || "stand";
  let slug = base;
  for (let i = 2; i < 60; i++) {
    const { data: taken } = await admin.from("stands").select("id").eq("slug", slug).maybeSingle();
    if (!taken) break;
    slug = `${base}-${i}`;
  }

  const { error: insertError } = await admin.from("stands").insert({
    owner_id: signUpData.user.id,
    slug,
    commercial_name: input.commercial_name,
    company_name: input.company_name,
    nif: input.nif,
    contact_name: input.contact_name,
    email: input.email,
    phone: input.phone,
    whatsapp: input.whatsapp || null,
    address: input.address,
    district: input.district,
    website: input.website || null,
    activity_id: input.activity_id || null,
    status: "pendente",
    terms_accepted_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error("registerStand:", insertError.message);
    // Sem stand associado a conta não serve de nada — limpar o utilizador criado.
    await admin.auth.admin.deleteUser(signUpData.user.id);
    return {
      ok: false,
      message: "Não foi possível registar o stand. Verifique os dados e tente novamente.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/painel?registo=sucesso");
}
