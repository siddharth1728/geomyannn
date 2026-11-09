import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getSessionUser } from "@/lib/auth/session";
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

// In-memory support tickets store for local development resilience
const supportTicketsStore: SupportTicket[] = [];

const SupportTicketSchema = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters").max(60).default("Guest User"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  issueType: z.enum(["inaccurate_place", "route_error", "feature_request", "general"]).default("inaccurate_place"),
  message: z.string().min(5, "Please provide at least 5 characters describing the issue").max(1000),
});

/**
 * GET /api/support
 * RESTRICTED: Admin only. Public users cannot view customer complaints or contact emails.
 */
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  const adminKey = request.headers.get("x-admin-key");
  const isAuthorized =
    user.role === "admin" ||
    (adminKey && process.env.ADMIN_API_KEY && adminKey === process.env.ADMIN_API_KEY);

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized. Administrative authorization required to access customer support records." },
      { status: 401 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("id, user_name, email, issue_type, message, status, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return NextResponse.json({ tickets: data, source: "supabase" });
      }
    } catch (e) {
      // Fallback to local store in non-production
    }
  }

  return NextResponse.json({ tickets: supportTicketsStore, source: "memory" });
}

/**
 * POST /api/support
 * Public ticket submission with anti-spam rate limiting and payload validation.
 */
export async function POST(request: NextRequest) {
  // 1. Anti-spam rate limiting: max 5 tickets per 10 minutes per IP
  const rateLimit = checkRateLimit(request, {
    limit: 5,
    windowMs: 600000,
    prefix: "support_submit",
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many submissions. Please wait ${rateLimit.resetSeconds} seconds before submitting another report.` },
      { status: 429 }
    );
  }

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
      userName: userName.trim(),
      email: email ? email.trim() : undefined,
      issueType,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: "open",
    };

    supportTicketsStore.push(newTicket);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { error } = await supabase.from("support_tickets").insert({
          id: ticketId,
          user_name: newTicket.userName,
          email: newTicket.email || null,
          issue_type: newTicket.issueType,
          message: newTicket.message,
          status: "open",
          created_at: newTicket.createdAt,
        });

        if (error) {
          console.warn("Supabase support ticket insert warning:", error.message);
        }
      } catch (e: any) {
        console.warn("Could not write ticket to Supabase:", e.message);
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
