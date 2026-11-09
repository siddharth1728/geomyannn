import { Meetup, MeetupMember, ParticipantLocation, CandidateVenue } from "@/types/meetup";
import { getSupabaseServerClient } from "../supabase/server";

// Global in-memory store so all Next.js API routes share the exact same instance across route boundaries
const globalStore = globalThis as unknown as {
  inMemoryMeetups?: Map<string, Meetup>;
};

export const inMemoryMeetups: Map<string, Meetup> =
  globalStore.inMemoryMeetups ?? new Map<string, Meetup>();

// Initialize flagship Hyderabad 4-origin demo
function seedHyderabadDemo() {
  const hydDemo: Meetup = {
    id: "hyd-demo-1",
    creatorId: "u1",
    creatorName: "Aarav",
    title: "Hyderabad Weekend Hangout",
    category: "cafe",
    description: "4 friends meeting from 4 corners of Hyderabad to find the fairest spot.",
    plannedAt: new Date(Date.now() + 86400000).toISOString(),
    budget: "moderate",
    transportMode: "car",
    status: "voting",
    inviteCode: "HYD789",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    preferences: {
      category: "cafe",
      budget: "moderate",
      cuisine: "any",
      dietary: "any",
      atmosphere: "casual",
      maxTravelTimeMinutes: 35,
    },
    members: [
      { id: "mem-1", meetupId: "hyd-demo-1", userId: "u1", userName: "Aarav", role: "creator", joinedAt: new Date().toISOString() },
      { id: "mem-2", meetupId: "hyd-demo-1", userId: "u2", userName: "Diya", role: "member", joinedAt: new Date().toISOString() },
      { id: "mem-3", meetupId: "hyd-demo-1", userId: "u3", userName: "Rohan", role: "member", joinedAt: new Date().toISOString() },
      { id: "mem-4", meetupId: "hyd-demo-1", userId: "u4", userName: "Ananya", role: "member", joinedAt: new Date().toISOString() },
    ],
    locations: [
      { id: "loc-1", meetupId: "hyd-demo-1", memberId: "u1", memberName: "Aarav", label: "Kukatpally", latitude: 17.4947, longitude: 78.3996, updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString() },
      { id: "loc-2", meetupId: "hyd-demo-1", memberId: "u2", memberName: "Diya", label: "Secunderabad", latitude: 17.4399, longitude: 78.4983, updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString() },
      { id: "loc-3", meetupId: "hyd-demo-1", memberId: "u3", memberName: "Rohan", label: "Mehdipatnam", latitude: 17.3916, longitude: 78.4414, updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString() },
      { id: "loc-4", meetupId: "hyd-demo-1", memberId: "u4", memberName: "Ananya", label: "Dilsukhnagar", latitude: 17.3688, longitude: 78.5247, updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString() },
    ],
    venues: [
      {
        id: "c-venue-roastery",
        meetupId: "hyd-demo-1",
        venueId: "roastery",
        name: "Roastery Coffee House",
        category: "cafe",
        address: "Road No 14, Banjara Hills",
        latitude: 17.4184,
        longitude: 78.4382,
        rating: 4.7,
        priceLevel: "₹₹",
        avgDurationSec: 1320,
        maxDurationSec: 1560,
        minDurationSec: 1080,
        disparitySec: 480,
        totalDurationSec: 5280,
        recommendationReason: "Exceptional fairness: only an 8-minute gap between closest and farthest friend.",
        participantTimes: [
          { memberId: "u1", memberName: "Aarav", originLabel: "Kukatpally", durationSeconds: 1560, distanceMeters: 13200 },
          { memberId: "u2", memberName: "Diya", originLabel: "Secunderabad", durationSeconds: 1380, distanceMeters: 11400 },
          { memberId: "u3", memberName: "Rohan", originLabel: "Mehdipatnam", durationSeconds: 1080, distanceMeters: 6200 },
          { memberId: "u4", memberName: "Ananya", originLabel: "Dilsukhnagar", durationSeconds: 1260, distanceMeters: 12800 },
        ],
        voteCount: 3,
      },
      {
        id: "c-venue-paradise",
        meetupId: "hyd-demo-1",
        venueId: "paradise",
        name: "Paradise Biryani",
        category: "restaurant",
        address: "MG Road, Secunderabad",
        latitude: 17.4416,
        longitude: 78.4878,
        rating: 4.5,
        priceLevel: "₹₹",
        avgDurationSec: 1260,
        maxDurationSec: 1980,
        minDurationSec: 360,
        disparitySec: 1620,
        totalDurationSec: 5040,
        recommendationReason: "Convenient for Diya (6 min), but involves up to a 33-minute trip for Aarav.",
        participantTimes: [
          { memberId: "u1", memberName: "Aarav", originLabel: "Kukatpally", durationSeconds: 1980, distanceMeters: 15400 },
          { memberId: "u2", memberName: "Diya", originLabel: "Secunderabad", durationSeconds: 360, distanceMeters: 2100 },
          { memberId: "u3", memberName: "Rohan", originLabel: "Mehdipatnam", durationSeconds: 1320, distanceMeters: 11800 },
          { memberId: "u4", memberName: "Ananya", originLabel: "Dilsukhnagar", durationSeconds: 1380, distanceMeters: 12200 },
        ],
        voteCount: 1,
      },
      {
        id: "c-venue-hardrock",
        meetupId: "hyd-demo-1",
        venueId: "hardrock",
        name: "Hard Rock Cafe",
        category: "entertainment",
        address: "GVK One Mall, Banjara Hills",
        latitude: 17.4194,
        longitude: 78.4485,
        rating: 4.6,
        priceLevel: "₹₹₹",
        avgDurationSec: 1380,
        maxDurationSec: 1620,
        minDurationSec: 1140,
        disparitySec: 480,
        totalDurationSec: 5520,
        recommendationReason: "Balanced central location with an average drive time of 23 minutes.",
        participantTimes: [
          { memberId: "u1", memberName: "Aarav", originLabel: "Kukatpally", durationSeconds: 1620, distanceMeters: 13800 },
          { memberId: "u2", memberName: "Diya", originLabel: "Secunderabad", durationSeconds: 1260, distanceMeters: 9800 },
          { memberId: "u3", memberName: "Rohan", originLabel: "Mehdipatnam", durationSeconds: 1140, distanceMeters: 6800 },
          { memberId: "u4", memberName: "Ananya", originLabel: "Dilsukhnagar", durationSeconds: 1500, distanceMeters: 13400 },
        ],
        voteCount: 0,
      },
    ],
    votes: {
      u1: "roastery",
      u3: "roastery",
      u4: "roastery",
      u2: "paradise",
    },
  };

  inMemoryMeetups.set(hydDemo.id, hydDemo);
  inMemoryMeetups.set(hydDemo.inviteCode, hydDemo);
}

// Production demo suppression: Demonstration fixtures are only seeded in non-production environments
if (process.env.NODE_ENV !== "production") {
  if (!globalStore.inMemoryMeetups) {
    globalStore.inMemoryMeetups = inMemoryMeetups;
    seedHyderabadDemo();
  } else if (!inMemoryMeetups.has("hyd-demo-1")) {
    seedHyderabadDemo();
  }
}

// Helper to generate a friendly 6-character alphanumeric invite code (e.g. HYD-782)
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HYD-${code}`;
}

export async function createMeetupInStore(meetupData: Omit<Meetup, "id" | "inviteCode" | "createdAt" | "expiresAt" | "members" | "locations" | "venues" | "votes">): Promise<Meetup> {
  const id = `meetup-${Date.now()}`;
  const inviteCode = generateInviteCode();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 86400000 * 7).toISOString();

  const creatorMember: MeetupMember = {
    id: `mem-${Date.now()}`,
    meetupId: id,
    userId: meetupData.creatorId,
    userName: meetupData.creatorName,
    role: "creator",
    joinedAt: now,
  };

  const newMeetup: Meetup = {
    ...meetupData,
    id,
    inviteCode,
    createdAt: now,
    expiresAt,
    members: [creatorMember],
    locations: [],
    venues: [],
    votes: {},
  };

  inMemoryMeetups.set(id, newMeetup);
  inMemoryMeetups.set(inviteCode, newMeetup); // index by invite code too

  // Attempt persisting to Supabase if configured & tables exist
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from("meetups").insert({
        id,
        creator_id: newMeetup.creatorId,
        creator_name: newMeetup.creatorName,
        title: newMeetup.title,
        category: newMeetup.category,
        description: newMeetup.description,
        planned_at: newMeetup.plannedAt,
        budget: newMeetup.budget,
        transport_mode: newMeetup.transportMode,
        status: newMeetup.status,
        invite_code: newMeetup.inviteCode,
        created_at: newMeetup.createdAt,
        expires_at: newMeetup.expiresAt,
      });

      await supabase.from("meetup_members").insert({
        meetup_id: id,
        user_id: creatorMember.userId,
        user_name: creatorMember.userName,
        role: "creator",
      });
    } catch (e) {
      console.warn("Supabase insert skipped, using memory store:", e);
    }
  }

  return newMeetup;
}

export function getMeetupFromStore(identifier: string): Meetup | null {
  // Check memory store (fast cache)
  const cached = inMemoryMeetups.get(identifier);
  if (cached) return cached;
  return null;
}

export async function fetchMeetupByIdOrCode(identifier: string): Promise<Meetup | null> {
  // Check memory store first
  const cached = inMemoryMeetups.get(identifier);
  if (cached) return cached;

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("meetups")
        .select(`
          id, creator_id, creator_name, title, category, description,
          planned_at, budget, transport_mode, status, confirmed_venue_id,
          invite_code, created_at, expires_at,
          members:meetup_members(id, user_id, user_name, role, joined_at),
          locations:meetup_locations(id, member_id, member_name, label, latitude, longitude, is_approximate, updated_at, expires_at),
          venues:meetup_venues(id, venue_id, name, category, address, latitude, longitude, rating, price_level, avg_duration_sec, max_duration_sec, min_duration_sec, disparity_sec, participant_times),
          votes:meetup_votes(member_id, venue_id)
        `)
        .or(`id.eq.${identifier},invite_code.eq.${identifier}`)
        .maybeSingle();

      if (data && !error) {
        const votesObj: Record<string, string> = {};
        if (Array.isArray(data.votes)) {
          data.votes.forEach((v: any) => {
            if (v.member_id && v.venue_id) votesObj[v.member_id] = v.venue_id;
          });
        }

        const loadedMeetup: Meetup = {
          id: data.id,
          creatorId: data.creator_id,
          creatorName: data.creator_name,
          title: data.title,
          category: data.category,
          description: data.description,
          plannedAt: data.planned_at,
          budget: data.budget,
          transportMode: data.transport_mode,
          status: data.status,
          confirmedVenueId: data.confirmed_venue_id,
          inviteCode: data.invite_code,
          createdAt: data.created_at,
          expiresAt: data.expires_at,
          members: (data.members || []).map((m: any) => ({
            id: m.id,
            meetupId: data.id,
            userId: m.user_id,
            userName: m.user_name,
            role: m.role,
            joinedAt: m.joined_at,
          })),
          locations: (data.locations || []).map((l: any) => ({
            id: l.id,
            meetupId: data.id,
            memberId: l.member_id,
            memberName: l.member_name,
            label: l.label,
            latitude: l.latitude,
            longitude: l.longitude,
            isApproximate: l.is_approximate,
            updatedAt: l.updated_at,
            expiresAt: l.expires_at,
          })),
          venues: (data.venues || []).map((v: any) => ({
            id: v.id,
            meetupId: data.id,
            venueId: v.venue_id,
            name: v.name,
            category: v.category,
            address: v.address,
            latitude: v.latitude,
            longitude: v.longitude,
            rating: v.rating,
            priceLevel: v.price_level,
            avgDurationSec: v.avg_duration_sec,
            maxDurationSec: v.max_duration_sec,
            minDurationSec: v.min_duration_sec,
            disparitySec: v.disparity_sec,
            totalDurationSec: v.avg_duration_sec,
            recommendationReason: "",
            participantTimes: v.participant_times || [],
            voteCount: 0,
          })),
          votes: votesObj,
        };

        inMemoryMeetups.set(loadedMeetup.id, loadedMeetup);
        inMemoryMeetups.set(loadedMeetup.inviteCode, loadedMeetup);
        return loadedMeetup;
      }
    } catch (e) {
      console.warn("Supabase query error in fetchMeetupByIdOrCode:", e);
    }
  }

  return null;
}

export function getAllMeetups(): Meetup[] {
  // Deduplicate entries by ID
  const unique = new Map<string, Meetup>();
  inMemoryMeetups.forEach((m) => unique.set(m.id, m));
  return Array.from(unique.values());
}

export function addMemberToMeetup(meetupId: string, userId: string, userName: string): MeetupMember | null {
  const meetup = inMemoryMeetups.get(meetupId);
  if (!meetup) return null;

  const existing = meetup.members.find((m) => m.userId === userId || m.userName.toLowerCase() === userName.toLowerCase());
  if (existing) return existing;

  const member: MeetupMember = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    meetupId,
    userId,
    userName,
    role: "member",
    joinedAt: new Date().toISOString(),
  };

  meetup.members.push(member);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase.from("meetup_members").insert({
        meetup_id: meetupId,
        user_id: userId,
        user_name: userName,
        role: "member",
      })
    )
      .then((res: any) => {
        if (res?.error) console.warn("Supabase member sync error:", res.error.message);
      })
      .catch((err: any) => console.warn("Supabase member sync error:", err));
  }

  return member;
}

export function setParticipantLocation(
  meetupId: string,
  memberId: string,
  memberName: string,
  label: string,
  latitude: number,
  longitude: number,
  isApproximate: boolean = false
): ParticipantLocation | null {
  const meetup = inMemoryMeetups.get(meetupId);
  if (!meetup) return null;

  // Revoke or update existing location for this member
  const existingIdx = meetup.locations.findIndex((l) => l.memberId === memberId);

  const loc: ParticipantLocation = {
    id: `loc-${memberId}`,
    meetupId,
    memberId,
    memberName,
    label,
    latitude,
    longitude,
    isApproximate,
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };

  if (existingIdx >= 0) {
    meetup.locations[existingIdx] = loc;
  } else {
    meetup.locations.push(loc);
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase
        .from("meetup_locations")
        .upsert(
          {
            meetup_id: meetupId,
            member_id: memberId,
            member_name: memberName,
            label,
            latitude,
            longitude,
            is_approximate: isApproximate,
            updated_at: loc.updatedAt,
            expires_at: loc.expiresAt,
          },
          { onConflict: "meetup_id,member_id" }
        )
    )
      .then((res: any) => {
        if (res?.error) console.warn("Supabase location upsert error:", res.error.message);
      })
      .catch((err: any) => console.warn("Supabase location upsert error:", err));
  }

  return loc;
}

export function updateMeetupVenues(meetupId: string, venues: CandidateVenue[]): boolean {
  const meetup = inMemoryMeetups.get(meetupId);
  if (!meetup) return false;

  meetup.venues = venues;
  meetup.status = "voting";

  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase
        .from("meetups")
        .update({ status: "voting" })
        .eq("id", meetupId)
    )
      .then(() => {})
      .catch((err: any) => console.warn("Supabase update error:", err));
  }

  return true;
}

export function recordVote(meetupId: string, memberId: string, venueId: string): boolean {
  const meetup = inMemoryMeetups.get(meetupId);
  if (!meetup) return false;

  meetup.votes[memberId] = venueId;

  // Recalculate vote counts
  const voteCounts: Record<string, number> = {};
  Object.values(meetup.votes).forEach((vId) => {
    voteCounts[vId] = (voteCounts[vId] || 0) + 1;
  });

  meetup.venues.forEach((v) => {
    v.voteCount = voteCounts[v.venueId] || 0;
  });

  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase
        .from("meetup_votes")
        .upsert(
          {
            meetup_id: meetupId,
            member_id: memberId,
            venue_id: venueId,
          },
          { onConflict: "meetup_id,member_id" }
        )
    )
      .then((res: any) => {
        if (res?.error) console.warn("Supabase vote sync error:", res.error.message);
      })
      .catch((err: any) => console.warn("Supabase vote sync error:", err));
  }

  return true;
}

export function confirmMeetupVenue(meetupId: string, venueId: string): boolean {
  const meetup = inMemoryMeetups.get(meetupId);
  if (!meetup) return false;

  meetup.confirmedVenueId = venueId;
  meetup.status = "confirmed";

  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase
        .from("meetups")
        .update({
          confirmed_venue_id: venueId,
          status: "confirmed",
        })
        .eq("id", meetupId)
    )
      .then((res: any) => {
        if (res?.error) console.warn("Supabase confirm sync error:", res.error.message);
      })
      .catch((err: any) => console.warn("Supabase confirm sync error:", err));
  }

  return true;
}

export function recordMeetupFeedback(
  meetupId: string,
  memberId: string,
  feedbackData: {
    rating: number;
    accuracy: "accurate" | "slight_delay" | "heavy_delay";
    suitability: "great" | "average" | "crowded";
    note?: string;
  }
): any {
  const meetup = inMemoryMeetups.get(meetupId);
  if (!meetup) return null;

  if (!meetup.feedback) {
    meetup.feedback = [];
  }

  const existingIdx = meetup.feedback.findIndex((f) => f.memberId === memberId);
  const fb = {
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    meetupId,
    memberId,
    rating: feedbackData.rating,
    accuracy: feedbackData.accuracy,
    suitability: feedbackData.suitability,
    note: feedbackData.note,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    meetup.feedback[existingIdx] = fb;
  } else {
    meetup.feedback.push(fb);
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase
        .from("meetup_feedback")
        .upsert(
          {
            meetup_id: meetupId,
            member_id: memberId,
            rating: feedbackData.rating,
            accuracy: feedbackData.accuracy,
            suitability: feedbackData.suitability,
            note: feedbackData.note || null,
          },
          { onConflict: "meetup_id,member_id" }
        )
    )
      .then((res: any) => {
        if (res?.error) console.warn("Supabase feedback sync error:", res.error.message);
      })
      .catch((err: any) => console.warn("Supabase feedback sync error:", err));
  }

  return fb;
}
