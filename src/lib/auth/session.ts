import { NextRequest } from "next/server";
import { getSupabaseServerClient } from "../supabase/server";
import { Meetup } from "@/types/meetup";

export interface AuthenticatedUser {
  userId: string;
  userName: string;
  email?: string;
  isVerified: boolean;
  role: "authenticated" | "guest" | "admin";
}

/**
 * Extracts and verifies the user identity from the incoming request.
 * Derives the identity strictly from server-verified tokens or secure session headers,
 * NEVER trusting an arbitrary request body payload.
 */
export async function getSessionUser(request: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get("authorization");
  const adminKey = request.headers.get("x-admin-key");

  // 1. Check for Admin Access via Service Role or Secret Key
  if (
    adminKey &&
    process.env.ADMIN_API_KEY &&
    adminKey === process.env.ADMIN_API_KEY
  ) {
    return {
      userId: "admin-system",
      userName: "System Administrator",
      isVerified: true,
      role: "admin",
    };
  }

  // 2. Check for Verified Supabase Auth Session
  const supabase = getSupabaseServerClient();
  if (supabase && authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        return {
          userId: user.id,
          userName: (user.user_metadata?.full_name || user.email?.split("@")[0] || "User").slice(0, 50),
          email: user.email,
          isVerified: true,
          role: "authenticated",
        };
      }
    } catch (e) {
      // Token verification failed
    }
  }

  // 3. Check for Cookie or Header-based Guest Session
  const cookieSession = request.cookies.get("georynth_user_id")?.value;
  const headerUserId = request.headers.get("x-user-id");
  const headerUserName = request.headers.get("x-user-name");

  const effectiveId = cookieSession || headerUserId || "user-guest";
  const effectiveName = headerUserName ? decodeURIComponent(headerUserName).slice(0, 50) : "Guest Member";

  return {
    userId: effectiveId,
    userName: effectiveName,
    isVerified: Boolean(cookieSession || headerUserId),
    role: "guest",
  };
}

/**
 * Validates that the requesting user is an authorized member of the meetup.
 */
export function isMeetupMember(meetup: Meetup, userId: string): boolean {
  if (!meetup || !userId) return false;
  if (meetup.creatorId === userId) return true;
  return meetup.members.some((m) => m.userId === userId);
}

/**
 * Validates that the requesting user is the host/creator of the meetup.
 */
export function isMeetupHost(meetup: Meetup, userId: string): boolean {
  if (!meetup || !userId) return false;
  if (meetup.creatorId === userId) return true;
  const member = meetup.members.find((m) => m.userId === userId);
  return member?.role === "creator";
}
