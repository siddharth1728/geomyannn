import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ppytdnhvvbmhaaurydza.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_1PBI0qGXF2hKfxqmkQhJkg_l0B5YuLU";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}
