import { NextResponse } from "next/server";
import { isServerSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const maptilerConfigured = Boolean(
    process.env.MAPTILER_GEOCODING_KEY || process.env.NEXT_PUBLIC_MAPTILER_KEY
  );
  const graphhopperConfigured = Boolean(process.env.GRAPHHOPPER_API_KEY);
  const supabaseConfigured = isServerSupabaseConfigured;

  return NextResponse.json({
    maptilerConfigured,
    graphhopperConfigured,
    supabaseConfigured,
    timestamp: new Date().toISOString(),
  });
}
