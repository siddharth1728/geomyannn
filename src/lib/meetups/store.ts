import { Meetup, MeetupMember, ParticipantLocation, CandidateVenue } from "@/types/meetup";
import { getSupabaseServerClient } from "../supabase/server";

// In-memory persistent store for development & offline resilience
const inMemoryMeetups: Map<string, Meetup> = new Map();

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
  return inMemoryMeetups.get(identifier) || null;
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

  return loc;
}

export function updateMeetupVenues(meetupId: string, venues: CandidateVenue[]): boolean {
  const meetup = inMemoryMeetups.get(meetupId);
  if (!meetup) return false;

  meetup.venues = venues;
  meetup.status = "voting";
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

  return true;
}

export function confirmMeetupVenue(meetupId: string, venueId: string): boolean {
  const meetup = inMemoryMeetups.get(meetupId);
  if (!meetup) return false;

  meetup.confirmedVenueId = venueId;
  meetup.status = "confirmed";
  return true;
}
