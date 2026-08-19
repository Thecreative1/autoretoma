import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Stand } from "@/lib/types";

/** Utilizador autenticado (ou null). Cacheado por pedido. */
export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile) ?? null;
});

export const getOwnStand = cache(async (): Promise<Stand | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("stands")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  return (data as Stand) ?? null;
});

/** Garante sessão iniciada; caso contrário redireciona para /entrar. */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");
  return user;
}

/** Garante que o utilizador é administrador. */
export async function requireAdmin() {
  const user = await requireUser();
  const profile = await getProfile();
  if (profile?.role !== "admin") redirect("/painel");
  return user;
}
