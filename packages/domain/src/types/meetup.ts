import { Coordinates } from "./geo";

export type MeetupCategory =
  | "restaurant"
  | "cafe"
  | "cinema"
  | "park"
  | "shopping"
  | "entertainment"
  | "sports"
  | "activity"
  | "other";

export type MeetupBudget = "budget" | "moderate" | "premium" | "any";

export type MeetupStatus = "draft" | "voting" | "confirmed" | "completed" | "cancelled";

export type RankingMode = "fairest" | "quickest" | "best_match";

export type CuisinePreference = 
  | "any"
  | "hyderabadi"
  | "north_indian"
  | "south_indian"
  | "asian"
  | "continental"
  | "italian"
  | "cafe_bakery";

export type DietaryRequirement = 
  | "any"
  | "pure_veg"
  | "halal"
  | "vegan"
  | "gluten_free";

export type AtmospherePreference = 
  | "casual"
  | "lively"
  | "cozy"
  | "fine_dining"
  | "outdoor"
  | "work_friendly";

export interface MeetupPreferences {
  category?: MeetupCategory;
  budget?: MeetupBudget;
  cuisine?: CuisinePreference;
  dietary?: DietaryRequirement;
  atmosphere?: AtmospherePreference;
  maxTravelTimeMinutes?: number;
  strictDietary?: boolean;
  strictMaxTravel?: boolean;
  strictBudget?: boolean;
}

export interface MeetupMember {
  id: string;
  meetupId: string;
  userId: string;
  userName: string;
  role: "creator" | "member";
  joinedAt: string;
}

export interface ParticipantLocation {
  id: string;
  meetupId: string;
  memberId: string;
  memberName: string;
  label: string;
  latitude: number;
  longitude: number;
  isApproximate?: boolean;
  updatedAt: string;
  expiresAt: string;
}

export interface ParticipantTravelTime {
  memberId: string;
  memberName: string;
  originLabel: string;
  durationSeconds: number;
  distanceMeters: number;
}

export interface CandidateVenue {
  id: string;
  meetupId: string;
  venueId: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  priceLevel?: string;
  imageUrl?: string;
  avgDurationSec: number;
  maxDurationSec: number;
  minDurationSec: number;
  disparitySec: number;
  totalDurationSec: number;
  recommendationReason: string;
  participantTimes: ParticipantTravelTime[];
  voteCount: number;
}

export interface MeetupVote {
  id: string;
  meetupId: string;
  venueId: string;
  memberId: string;
  memberName: string;
  createdAt: string;
}

export interface Meetup {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  category: MeetupCategory;
  description?: string;
  plannedAt: string;
  budget?: MeetupBudget;
  transportMode: "car" | "bike" | "foot";
  status: MeetupStatus;
  confirmedVenueId?: string;
  inviteCode: string;
  createdAt: string;
  expiresAt: string;
  preferences?: MeetupPreferences;
  members: MeetupMember[];
  locations: ParticipantLocation[];
  venues: CandidateVenue[];
  votes: Record<string, string>; // memberId -> venueId
}
