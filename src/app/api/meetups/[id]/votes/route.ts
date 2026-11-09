import { NextRequest, NextResponse } from "next/server";
import { getMeetupFromStore, recordVote } from "@/lib/meetups/store";
import { getSessionUser, isMeetupMember } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meetup = getMeetupFromStore(id);

  if (!meetup) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  const user = await getSessionUser(request);
  const body = await request.json().catch(() => null);

  if (!body || !body.venueId) {
    return NextResponse.json(
      { error: "venueId is required to cast vote" },
      { status: 400 }
    );
  }

  const effectiveMemberId = body.memberId || user.userId;

  // Authorization check: User must be an authorized member of the meetup
  if (!isMeetupMember(meetup, effectiveMemberId) && !isMeetupMember(meetup, user.userId)) {
    return NextResponse.json(
      { error: "Forbidden. Only members of this meetup can cast a vote." },
      { status: 403 }
    );
  }

  const success = recordVote(id, effectiveMemberId, body.venueId);

  if (!success) {
    return NextResponse.json({ error: "Failed to record vote for meetup" }, { status: 404 });
  }

  const updated = getMeetupFromStore(id);
  return NextResponse.json({ meetup: updated, votes: updated?.votes });
}
