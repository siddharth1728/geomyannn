import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { NativeMap } from "../../components/NativeMap";
import { VenueCard } from "../../components/VenueCard";
import { RankingModeSelector } from "../../components/RankingModeSelector";
import {
  CandidateVenue,
  ParticipantLocation,
  RankingMode,
  rankVenues,
} from "@georynth/domain";

// Real Hyderabad 4-Origin Scenario
const initialParticipants: ParticipantLocation[] = [
  {
    id: "loc-1",
    meetupId: "hyd-demo-1",
    memberId: "u1",
    memberName: "Aarav",
    label: "Kukatpally",
    latitude: 17.4947,
    longitude: 78.3996,
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "loc-2",
    meetupId: "hyd-demo-1",
    memberId: "u2",
    memberName: "Diya",
    label: "Secunderabad",
    latitude: 17.4399,
    longitude: 78.4983,
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "loc-3",
    meetupId: "hyd-demo-1",
    memberId: "u3",
    memberName: "Rohan",
    label: "Mehdipatnam",
    latitude: 17.3916,
    longitude: 78.4414,
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "loc-4",
    meetupId: "hyd-demo-1",
    memberId: "u4",
    memberName: "Ananya",
    label: "Dilsukhnagar",
    latitude: 17.3688,
    longitude: 78.5247,
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
];

// Real Hyderabad Venues with calculated travel times from the 4 origins
const initialVenues: CandidateVenue[] = [
  {
    id: "venue-roastery",
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
    disparitySec: 480, // 8 minutes disparity! Highly fair
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
    id: "venue-paradise",
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
    disparitySec: 1620, // 27 minutes disparity
    totalDurationSec: 5040,
    recommendationReason: "Convenient for Diya (6m), but involves up to a 33-minute trip for Aarav.",
    participantTimes: [
      { memberId: "u1", memberName: "Aarav", originLabel: "Kukatpally", durationSeconds: 1980, distanceMeters: 15400 },
      { memberId: "u2", memberName: "Diya", originLabel: "Secunderabad", durationSeconds: 360, distanceMeters: 2100 },
      { memberId: "u3", memberName: "Rohan", originLabel: "Mehdipatnam", durationSeconds: 1320, distanceMeters: 11800 },
      { memberId: "u4", memberName: "Ananya", originLabel: "Dilsukhnagar", durationSeconds: 1380, distanceMeters: 12200 },
    ],
    voteCount: 1,
  },
  {
    id: "venue-hardrock",
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
];

export default function MeetupDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [rankingMode, setRankingMode] = useState<RankingMode>("fairest");
  const [selectedVenueId, setSelectedVenueId] = useState<string>("venue-roastery");
  const [votedVenueId, setVotedVenueId] = useState<string>("venue-roastery");
  const [confirmedVenueId, setConfirmedVenueId] = useState<string | null>(null);

  const sortedVenues = rankVenues(initialVenues, rankingMode);

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: "Join our meetup on GEORYNTH! Enter invite code: HYD789 or open georynth://meetup/HYD789",
        title: "GEORYNTH Meetup Invitation",
      });
    } catch (e) {
      console.warn("Share failed", e);
    }
  };

  const handleVote = (venueId: string) => {
    setVotedVenueId(venueId);
    Alert.alert("Vote Recorded", "Your preference has been submitted to the group.");
  };

  const handleConfirm = (venueId: string) => {
    setConfirmedVenueId(venueId);
    Alert.alert(
      "Venue Confirmed! 🎉",
      "Roastery Coffee House is locked in as the official meetup location. Turn-by-turn routes are now ready."
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Half: Native Map with Participants & Venues */}
      <View style={styles.mapContainer}>
        <NativeMap
          participants={initialParticipants}
          venues={sortedVenues}
          selectedVenueId={selectedVenueId}
          onSelectVenue={(v) => setSelectedVenueId(v.id)}
        />

        {/* Floating Invite Code Badge */}
        <TouchableOpacity onPress={handleShareInvite} style={styles.invitePill}>
          <Text style={styles.invitePillLabel}>Invite Code:</Text>
          <Text style={styles.invitePillCode}>HYD789</Text>
          <Text style={styles.invitePillShare}>📤 Share</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Half: Sliding Roster & Venue Shortlist */}
      <View style={styles.sheetContainer}>
        <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.meetupTitle}>Hyderabad Weekend Hangout</Text>
              <Text style={styles.meetupSubtitle}>4 friends • Central Hyderabad Discovery</Text>
            </View>
          </View>

          {/* Participant Roster Bar */}
          <View style={styles.rosterSection}>
            <Text style={styles.rosterHeading}>PARTICIPANTS ({initialParticipants.length})</Text>
            <View style={styles.rosterChips}>
              {initialParticipants.map((p) => (
                <View key={p.id} style={styles.rosterChip}>
                  <Text style={styles.rosterAvatar}>
                    {p.memberName[0].toUpperCase()}
                  </Text>
                  <View>
                    <Text style={styles.rosterName}>{p.memberName}</Text>
                    <Text style={styles.rosterOrigin}>{p.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 3-Mode Fairness Selector */}
          <View style={styles.modeSection}>
            <Text style={styles.rosterHeading}>RECOMMENDATION CRITERIA</Text>
            <RankingModeSelector
              currentMode={rankingMode}
              onSelectMode={setRankingMode}
            />
          </View>

          {/* Candidate Venues List */}
          <Text style={styles.rosterHeading}>CANDIDATE VENUES ({sortedVenues.length})</Text>
          {sortedVenues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              isSelected={venue.id === selectedVenueId}
              hasVoted={votedVenueId === venue.id}
              isConfirmed={confirmedVenueId === venue.id}
              isCreator={true}
              onSelect={() => setSelectedVenueId(venue.id)}
              onVote={() => handleVote(venue.id)}
              onConfirm={() => handleConfirm(venue.id)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  mapContainer: {
    height: "40%",
    position: "relative",
  },
  invitePill: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0284c7",
    gap: 6,
  },
  invitePillLabel: {
    color: "#94a3b8",
    fontSize: 11,
  },
  invitePillCode: {
    color: "#38bdf8",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 1,
  },
  invitePillShare: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: "#020617",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(51, 65, 85, 0.8)",
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  meetupTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
  },
  meetupSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  rosterSection: {
    marginBottom: 16,
  },
  rosterHeading: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  rosterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rosterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.6)",
    gap: 8,
  },
  rosterAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#0284c7",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "700",
    fontSize: 11,
  },
  rosterName: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "600",
  },
  rosterOrigin: {
    color: "#38bdf8",
    fontSize: 10,
  },
  modeSection: {
    marginBottom: 16,
  },
});
