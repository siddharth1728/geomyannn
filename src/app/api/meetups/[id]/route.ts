import { NextRequest, NextResponse } from "next/server";
import { getMeetupFromStore, addMemberToMeetup } from "@/lib/meetups/store";

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

  return NextResponse.json({ meetup });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Join meetup
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || !body.userName) {
    return NextResponse.json({ error: "userName is required to join meetup" }, { status: 400 });
  }

  const userId = body.userId || `usr-${Date.now()}`;
  const member = addMemberToMeetup(id, userId, body.userName);

  if (!member) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  const meetup = getMeetupFromStore(id);
  return NextResponse.json({ member, meetup });
}
