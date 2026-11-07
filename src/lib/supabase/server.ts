import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ppytdnhvvbmhaaurydza.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_1PBI0qGXF2hKfxqmkQhJkg_l0B5YuLU";

export const isServerSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceKey);

export function getSupabaseServerClient() {
  if (!isServerSupabaseConfigured || !supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
