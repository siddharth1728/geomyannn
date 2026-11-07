import { NextRequest, NextResponse } from "next/server";
import { getMeetupFromStore, recordVote } from "@/lib/meetups/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || !body.memberId || !body.venueId) {
    return NextResponse.json(
      { error: "memberId and venueId are required to cast vote" },
      { status: 400 }
    );
  }

  const success = recordVote(id, body.memberId, body.venueId);

  if (!success) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  const meetup = getMeetupFromStore(id);
  return NextResponse.json({ meetup, votes: meetup?.votes });
}
