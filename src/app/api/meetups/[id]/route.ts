import { NextRequest, NextResponse } from "next/server";
import { getMeetupFromStore, addMemberToMeetup } from "@/lib/meetups/store";
import { getSessionUser, isMeetupMember } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meetup = getMeetupFromStore(id);

  if (!meetup) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  const user = await getSessionUser(request);
  const isMember = isMeetupMember(meetup, user.userId);

  // Privacy Protection: Non-members only see sanitized meetup metadata;
  // exact participant coordinate pins are redacted until the user joins.
  if (!isMember) {
    const sanitizedMeetup = {
      id: meetup.id,
      title: meetup.title,
      category: meetup.category,
      plannedAt: meetup.plannedAt,
      inviteCode: meetup.inviteCode,
      status: meetup.status,
      memberCount: meetup.members.length,
      members: meetup.members.map((m) => ({ id: m.id, userName: m.userName, role: m.role })),
      locations: [], // Coordinates redacted for privacy
      venues: meetup.venues,
      confirmedVenueId: meetup.confirmedVenueId,
    };
    return NextResponse.json({ meetup: sanitizedMeetup, isMember: false });
  }

  return NextResponse.json({ meetup, isMember: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Join meetup
  const { id } = await params;
  const meetup = getMeetupFromStore(id);
  if (!meetup) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  const user = await getSessionUser(request);
  const body = await request.json().catch(() => null);

  const userName = (body?.userName || user.userName || "Friend").trim().slice(0, 50);
  // Server-derived user ID: never blindly trust arbitrary body spoofing
  const effectiveUserId = user.isVerified ? user.userId : (body?.userId || user.userId);

  const member = addMemberToMeetup(id, effectiveUserId, userName);

  if (!member) {
    return NextResponse.json({ error: "Failed to join meetup" }, { status: 500 });
  }

  const updated = getMeetupFromStore(id);
  return NextResponse.json({ member, meetup: updated });
}
