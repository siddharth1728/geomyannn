import { NextResponse } from "next/server";
import { isServerSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const maptilerConfigured = Boolean(
    process.env.MAPTILER_GEOCODING_KEY ||
      process.env.NEXT_PUBLIC_MAPTILER_KEY ||
      "gDCzA1avLA0udEVVgHhl"
  );
  const graphhopperConfigured = Boolean(
    process.env.GRAPHHOPPER_API_KEY || "6ebdeb32-4581-4b86-97f7-c187909e4a07"
  );
  const supabaseConfigured = isServerSupabaseConfigured;

  return NextResponse.json({
    maptilerConfigured,
    graphhopperConfigured,
    supabaseConfigured,
    timestamp: new Date().toISOString(),
  });
}
