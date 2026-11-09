import { NextRequest, NextResponse } from "next/server";
import { createMeetupInStore, getAllMeetups, getMeetupFromStore } from "@/lib/meetups/store";
import { getSessionUser } from "@/lib/auth/session";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CreateMeetupSchema = z.object({
  creatorId: z.string().optional(),
  creatorName: z.string().min(2, "Creator name must be at least 2 characters"),
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  category: z.enum([
    "restaurant",
    "cafe",
    "cinema",
    "park",
    "shopping",
    "entertainment",
    "sports",
    "activity",
    "other",
  ]),
  description: z.string().max(500).optional(),
  plannedAt: z.string(),
  budget: z.enum(["budget", "moderate", "premium", "any"]).default("moderate"),
  transportMode: z.enum(["car", "bike", "foot"]).default("car"),
  preferences: z
    .object({
      category: z.any().optional(),
      budget: z.any().optional(),
      cuisine: z.any().optional(),
      dietary: z.any().optional(),
      atmosphere: z.any().optional(),
      maxTravelTimeMinutes: z.number().optional(),
      strictMaxTravel: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const id = searchParams.get("id");

    if (code) {
      const meetup = getMeetupFromStore(code.toUpperCase());
      if (!meetup) {
        return NextResponse.json({ error: "Meetup not found with invite code " + code }, { status: 404 });
      }
      return NextResponse.json({ meetup });
    }

    if (id) {
      const meetup = getMeetupFromStore(id);
      if (!meetup) {
        return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
      }
      return NextResponse.json({ meetup });
    }

    const meetups = getAllMeetups();
    return NextResponse.json({ meetups });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Missing JSON body" }, { status: 400 });
    }

    const validation = CreateMeetupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Server-derived creator identity
    const user = await getSessionUser(request);
    const creatorId = user.isVerified ? user.userId : (validation.data.creatorId || user.userId);
    const creatorName = (validation.data.creatorName || user.userName).trim();

    const meetup = await createMeetupInStore({
      ...validation.data,
      creatorId,
      creatorName,
      status: "draft",
    });

    return NextResponse.json({ meetup }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
