import { createClient } from "@supabase/supabase-js";
import { MOBILE_CONFIG } from "./config";

export const mobileSupabase = createClient(
  MOBILE_CONFIG.SUPABASE_URL,
  MOBILE_CONFIG.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
