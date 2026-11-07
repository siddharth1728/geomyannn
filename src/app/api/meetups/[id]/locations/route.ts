import { NextRequest, NextResponse } from "next/server";
import { getMeetupFromStore, setParticipantLocation } from "@/lib/meetups/store";
import { z } from "zod";

export const dynamic = "force-dynamic";

const LocationSchema = z.object({
  memberId: z.string(),
  memberName: z.string(),
  label: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isApproximate: z.boolean().default(false),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meetup = getMeetupFromStore(id);

  if (!meetup) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  return NextResponse.json({ locations: meetup.locations });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  const validation = LocationSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid location coordinates", details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { memberId, memberName, label, latitude, longitude, isApproximate } = validation.data;

  const loc = setParticipantLocation(
    id,
    memberId,
    memberName,
    label,
    latitude,
    longitude,
    isApproximate
  );

  if (!loc) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  const meetup = getMeetupFromStore(id);
  return NextResponse.json({ location: loc, meetup });
}
