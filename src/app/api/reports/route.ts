import { NextRequest, NextResponse } from "next/server";
import { CommunityReportInputSchema } from "@/lib/validation/schemas";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CommunityReport } from "@/types/geo";

// Fallback seed reports (clearly labeled sample data for initial mission exploration)
const SEED_HYDERABAD_REPORTS: CommunityReport[] = [
  {
    id: "rep-hyd-1",
    createdBy: null,
    category: "pothole",
    description: "Deep asphalt depression on inner ring road approaching Mehdipatnam flyover.",
    latitude: 17.3916,
    longitude: 78.4398,
    status: "reported",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 28).toISOString(),
  },
  {
    id: "rep-hyd-2",
    createdBy: null,
    category: "traffic_disruption",
    description: "Metro station construction barricades causing lane constriction near Begumpet.",
    latitude: 17.4447,
    longitude: 78.4664,
    status: "verified",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 20).toISOString(),
  },
  {
    id: "rep-hyd-3",
    createdBy: null,
    category: "waterlogging",
    description: "Drainage overflow during high rainfall sector around Hussain Sagar lake promenade.",
    latitude: 17.4239,
    longitude: 78.4738,
    status: "reported",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 29).toISOString(),
  },
];

// In-memory reports store for local development when Supabase credentials are pending
let localReportsStore: CommunityReport[] = [...SEED_HYDERABAD_REPORTS];

export async function GET() {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("community_reports")
        .select("id, created_by, category, description, latitude, longitude, status, created_at, expires_at")
        .gt("expires_at", new Date().toISOString())
        .neq("status", "dismissed")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase query failed, falling back to local store:", error.message);
      } else if (data) {
        const reports: CommunityReport[] = data.map((d: any) => ({
          id: d.id,
          createdBy: d.created_by,
          category: d.category,
          description: d.description,
          latitude: d.latitude,
          longitude: d.longitude,
          status: d.status,
          createdAt: d.created_at,
          expiresAt: d.expires_at,
        }));
        return NextResponse.json({ reports, source: "supabase" });
      }
    } catch (e) {
      console.warn("Supabase connection error:", e);
    }
  }

  return NextResponse.json({ reports: localReportsStore, source: "local_store" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Missing report payload" }, { status: 400 });
    }

    const validation = CommunityReportInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { category, description, latitude, longitude } = validation.data;
    const supabase = getSupabaseServerClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("community_reports")
          .insert([
            {
              category,
              description,
              latitude,
              longitude,
              status: "reported",
            },
          ])
          .select()
          .single();

        if (error) {
          throw error;
        }

        const report: CommunityReport = {
          id: data.id,
          createdBy: data.created_by,
          category: data.category,
          description: data.description,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          createdAt: data.created_at,
          expiresAt: data.expires_at,
        };

        return NextResponse.json({ report, source: "supabase" }, { status: 201 });
      } catch (err: any) {
        console.warn("Failed saving report to Supabase, falling back to local memory:", err.message);
      }
    }

    // Persist in memory store for session
    const newReport: CommunityReport = {
      id: `rep-loc-${Date.now()}`,
      createdBy: null,
      category,
      description,
      latitude,
      longitude,
      status: "reported",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    };

    localReportsStore.unshift(newReport);
    return NextResponse.json({ report: newReport, source: "local_store" }, { status: 201 });
  } catch (error) {
    console.error("Community report POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
