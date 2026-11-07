import { MOBILE_CONFIG } from "./config";
import { Meetup, CandidateVenue } from "@georynth/domain";

export class MobileApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = MOBILE_CONFIG.API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getMeetup(id: string): Promise<Meetup | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/meetups/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.meetup || null;
    } catch (e) {
      console.warn("getMeetup error:", e);
      return null;
    }
  }

  async createMeetup(payload: any): Promise<{ meetup?: Meetup; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/meetups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Failed to create meetup" };
      }
      return { meetup: data.meetup };
    } catch (e: any) {
      return { error: e.message || "Network error creating meetup" };
    }
  }

  async shareLocation(meetupId: string, locationData: {
    memberId: string;
    memberName: string;
    label: string;
    latitude: number;
    longitude: number;
    isApproximate?: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/meetups/${meetupId}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData),
      });
      return { success: res.ok };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async calculateMatrix(meetupId: string): Promise<{ venues?: CandidateVenue[]; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/meetups/${meetupId}/matrix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Matrix calculation failed" };
      return { venues: data.venues };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  async castVote(meetupId: string, memberId: string, venueId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/meetups/${meetupId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, venueId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async confirmVenue(meetupId: string, venueId: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/api/meetups/${meetupId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId }),
      });
      return await res.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

export const mobileApi = new MobileApiClient();
