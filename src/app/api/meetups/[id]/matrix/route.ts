import { NextRequest, NextResponse } from "next/server";
import { getMeetupFromStore, updateMeetupVenues } from "@/lib/meetups/store";
import { searchCandidateVenues } from "@/lib/providers/venues";
import { calculateGroupTravelMatrix, rankVenues } from "@/lib/providers/matrix";
import { RankingMode } from "@/types/meetup";

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

  if (meetup.locations.length === 0) {
    return NextResponse.json(
      { error: "At least one participant location is required to calculate travel times." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const rankingMode: RankingMode = body.rankingMode || "fairest";

  // Calculate group geographical centroid
  const sumLat = meetup.locations.reduce((acc, l) => acc + l.latitude, 0);
  const sumLon = meetup.locations.reduce((acc, l) => acc + l.longitude, 0);
  const center = {
    latitude: sumLat / meetup.locations.length,
    longitude: sumLon / meetup.locations.length,
  };

  // 1. Fetch real candidate venues for this category
  const { venues: rawVenues } = await searchCandidateVenues(meetup.category, center, 6);

  // 2. Prepare origins & destinations for GraphHopper Matrix API
  const origins = meetup.locations.map((loc) => ({
    memberId: loc.memberId,
    memberName: loc.memberName,
    label: loc.label,
    latitude: loc.latitude,
    longitude: loc.longitude,
  }));

  const destinations = rawVenues.map((v) => ({
    venueId: v.venueId,
    name: v.name,
    category: v.category,
    address: v.address,
    latitude: v.latitude,
    longitude: v.longitude,
    rating: v.rating,
    priceLevel: v.priceLevel,
    imageUrl: v.imageUrl,
  }));

  // 3. Compute road-network travel matrix
  const { venues, error } = await calculateGroupTravelMatrix(
    origins,
    destinations,
    meetup.transportMode,
    meetup.id
  );

  if (error || venues.length === 0) {
    return NextResponse.json(
      { error: error || "Failed to calculate travel matrix." },
      { status: 502 }
    );
  }

  // 4. Rank candidate venues
  const ranked = rankVenues(venues, rankingMode);

  // 5. Update meetup store
  updateMeetupVenues(id, ranked);

  return NextResponse.json({
    venues: ranked,
    centroid: center,
    participantCount: origins.length,
    rankingMode,
  });
}
