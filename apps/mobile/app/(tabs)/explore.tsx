import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { NativeMap } from "../../components/NativeMap";
import { CandidateVenue } from "@georynth/domain";

const samplePOIs: CandidateVenue[] = [
  {
    id: "poi-1",
    meetupId: "explore",
    venueId: "paradise",
    name: "Paradise Biryani",
    category: "restaurant",
    address: "MG Road, Secunderabad",
    latitude: 17.4416,
    longitude: 78.4878,
    rating: 4.6,
    avgDurationSec: 900,
    maxDurationSec: 1200,
    minDurationSec: 600,
    disparitySec: 600,
    totalDurationSec: 2700,
    recommendationReason: "Flagship Hyderabadi cuisine landmark",
    participantTimes: [],
    voteCount: 0,
  },
  {
    id: "poi-2",
    meetupId: "explore",
    venueId: "roastery",
    name: "Roastery Coffee House",
    category: "cafe",
    address: "Road No 14, Banjara Hills",
    latitude: 17.4184,
    longitude: 78.4382,
    rating: 4.7,
    avgDurationSec: 1050,
    maxDurationSec: 1300,
    minDurationSec: 800,
    disparitySec: 500,
    totalDurationSec: 3150,
    recommendationReason: "Artisanal coffee and serene garden atmosphere",
    participantTimes: [],
    voteCount: 0,
  },
  {
    id: "poi-3",
    meetupId: "explore",
    venueId: "amb-cinemas",
    name: "AMB Cinemas",
    category: "cinema",
    address: "Gachibowli - Miyapur Rd",
    latitude: 17.4619,
    longitude: 78.3683,
    rating: 4.8,
    avgDurationSec: 1300,
    maxDurationSec: 1600,
    minDurationSec: 1000,
    disparitySec: 600,
    totalDurationSec: 3900,
    recommendationReason: "World-class laser projection & VIP lounge",
    participantTimes: [],
    voteCount: 0,
  },
];

const categories = [
  { id: "all", label: "All Places" },
  { id: "restaurant", label: "Restaurants" },
  { id: "cafe", label: "Cafes" },
  { id: "cinema", label: "Cinemas" },
  { id: "park", label: "Parks" },
  { id: "shopping", label: "Shopping" },
];

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState<CandidateVenue | null>(null);

  const filteredVenues = samplePOIs.filter((v) =>
    selectedCategory === "all" ? true : v.category === selectedCategory
  );

  return (
    <View style={styles.container}>
      <NativeMap
        venues={filteredVenues}
        selectedVenueId={selectedVenue?.id}
        onSelectVenue={(v) => setSelectedVenue(v)}
      />

      {/* Floating Search Bar */}
      <View style={styles.searchOverlay}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search Hyderabad places, cafes, landmarks..."
            placeholderTextColor="#64748b"
            style={styles.searchInput}
          />
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCategory(c.id)}
              style={[
                styles.categoryChip,
                selectedCategory === c.id && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === c.id && styles.categoryChipTextActive,
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selected Venue Preview Card */}
      {selectedVenue && (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewTitle}>{selectedVenue.name}</Text>
              <Text style={styles.previewAddress}>{selectedVenue.address}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedVenue(null)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.previewReason}>{selectedVenue.recommendationReason}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  searchOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    gap: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.94)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.8)",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 14,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
  },
  categoryChipActive: {
    backgroundColor: "#0284c7",
    borderColor: "#38bdf8",
  },
  categoryChipText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  previewCard: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#06b6d4",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  previewTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  previewAddress: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: "#94a3b8",
    fontSize: 16,
  },
  previewReason: {
    color: "#38bdf8",
    fontSize: 12,
    marginTop: 6,
    fontStyle: "italic",
  },
});
