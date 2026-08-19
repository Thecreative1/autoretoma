import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com service role — ignora RLS. Usar APENAS no servidor e apenas
 * em operações controladas (leads, auditoria, estatísticas administrativas).
 * A chave nunca chega ao browser: este módulo importa "server-only".
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
