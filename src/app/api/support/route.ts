import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

export interface SupportTicket {
  id: string;
  userName: string;
  email?: string;
  issueType: "inaccurate_place" | "route_error" | "feature_request" | "general";
  message: string;
  createdAt: string;
  status: "open" | "in_review" | "resolved";
}

// In-memory support tickets store for local resilience
const supportTicketsStore: SupportTicket[] = [];

const SupportTicketSchema = z.object({
  userName: z.string().min(2, "Name is required").default("Guest User"),
  email: z.string().email().optional().or(z.literal("")),
  issueType: z.enum(["inaccurate_place", "route_error", "feature_request", "general"]).default("inaccurate_place"),
  message: z.string().min(5, "Please provide at least 5 characters describing the issue").max(1000),
});

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return NextResponse.json({ tickets: data, source: "supabase" });
      }
    } catch (e) {
      // Fallback
    }
  }

  return NextResponse.json({ tickets: supportTicketsStore, source: "memory" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Missing JSON body" }, { status: 400 });
    }

    const validation = SupportTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { userName, email, issueType, message } = validation.data;
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newTicket: SupportTicket = {
      id: ticketId,
      userName,
      email: email || undefined,
      issueType,
      message,
      createdAt: new Date().toISOString(),
      status: "open",
    };

    supportTicketsStore.push(newTicket);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from("support_tickets").insert({
          id: ticketId,
          user_name: userName,
          email: email || null,
          issue_type: issueType,
          message,
          status: "open",
          created_at: newTicket.createdAt,
        });
      } catch (e) {
        console.warn("Could not write ticket to Supabase, saved to local store:", e);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Support ticket received. Our team will review this report.",
        ticketId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
