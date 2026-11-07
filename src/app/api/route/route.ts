import { NextRequest, NextResponse } from "next/server";
import { RouteRequestSchema } from "@/lib/validation/schemas";
import { calculateRoute } from "@/lib/providers/graphhopper";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Missing JSON request body" }, { status: 400 });
    }

    const validation = RouteRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid route request parameters", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { origin, destination, mode } = validation.data;
    const { route, error, status } = await calculateRoute(origin, destination, mode);

    if (error || !route) {
      return NextResponse.json({ error: error || "Routing failed" }, { status });
    }

    return NextResponse.json({ route });
  } catch (error) {
    console.error("Routing route error:", error);
    return NextResponse.json(
      { error: "Internal routing calculation error" },
      { status: 500 }
    );
  }
}
