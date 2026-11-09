import { NextRequest, NextResponse } from "next/server";
import { getMeetupFromStore, recordMeetupFeedback } from "@/lib/meetups/store";
import { getSessionUser, isMeetupMember } from "@/lib/auth/session";
import { z } from "zod";

export const dynamic = "force-dynamic";

const FeedbackSchema = z.object({
  memberId: z.string().optional(),
  rating: z.number().min(1).max(5),
  accuracy: z.enum(["accurate", "slight_delay", "heavy_delay"]),
  suitability: z.enum(["great", "average", "crowded"]),
  note: z.string().max(500).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meetup = getMeetupFromStore(id);
    if (!meetup) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const user = await getSessionUser(request);
    if (!isMeetupMember(meetup, user.userId)) {
      return NextResponse.json(
        { error: "Forbidden. Only members can view meetup feedback." },
        { status: 403 }
      );
    }

    return NextResponse.json({ feedback: meetup.feedback || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meetup = getMeetupFromStore(id);
    if (!meetup) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const user = await getSessionUser(request);
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Missing JSON body" }, { status: 400 });
    }

    const validation = FeedbackSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const effectiveMemberId = validation.data.memberId || user.userId;
    if (!isMeetupMember(meetup, effectiveMemberId) && !isMeetupMember(meetup, user.userId)) {
      return NextResponse.json(
        { error: "Forbidden. Only members of this meetup can submit feedback." },
        { status: 403 }
      );
    }

    const fb = recordMeetupFeedback(id, effectiveMemberId, {
      rating: validation.data.rating,
      accuracy: validation.data.accuracy,
      suitability: validation.data.suitability,
      note: validation.data.note,
    });

    const updated = getMeetupFromStore(id);
    return NextResponse.json({ success: true, feedback: fb, meetup: updated }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
