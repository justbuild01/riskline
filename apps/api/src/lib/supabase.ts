import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service role key. This bypasses RLS
 * and must never be sent to a browser — it only ever runs in apps/api.
 *
 * Lazily initialized so routes that don't touch Supabase (e.g. /health) can
 * still run before the Supabase project is wired up. Any route that DOES
 * need it fails loudly and immediately if the env vars are missing — matches
 * ruleset Section 6 rule 3 (missing resource = stop, don't route around it).
 */
export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env and fill both in."
    );
  }

  cached = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return cached;
}
