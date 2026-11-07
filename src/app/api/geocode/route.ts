import { NextRequest, NextResponse } from "next/server";
import { GeocodeQuerySchema } from "@/lib/validation/schemas";
import { geocodeSearch } from "@/lib/providers/maptiler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const proximity = searchParams.get("proximity") ?? undefined;
    const limit = searchParams.get("limit") ?? "5";

    const validation = GeocodeQuerySchema.safeParse({ q, proximity, limit });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { results, provider, error } = await geocodeSearch(
      validation.data.q,
      validation.data.proximity,
      validation.data.limit
    );

    if (error && results.length === 0) {
      return NextResponse.json({ error, results: [], provider }, { status: 502 });
    }

    return NextResponse.json({ results, provider, query: validation.data.q });
  } catch (error) {
    console.error("Geocoding route error:", error);
    return NextResponse.json(
      { error: "Internal geocoding service error" },
      { status: 500 }
    );
  }
}
