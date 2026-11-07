import React from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from "react-native";
import { formatCoordinates } from "@georynth/domain";

interface SavedPlace {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  savedAt: string;
}

const savedData: SavedPlace[] = [
  {
    id: "sp-1",
    name: "Roastery Coffee House",
    category: "Cafe",
    latitude: 17.4184,
    longitude: 78.4382,
    savedAt: "Saved yesterday",
  },
  {
    id: "sp-2",
    name: "Charminar Historic Center",
    category: "Landmark",
    latitude: 17.3616,
    longitude: 78.4747,
    savedAt: "Saved 3 days ago",
  },
  {
    id: "sp-3",
    name: "Hitec City Cyber Towers",
    category: "Tech Hub",
    latitude: 17.4504,
    longitude: 78.3808,
    savedAt: "Saved last week",
  },
];

export default function SavedPlacesScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={savedData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.categoryBadge}>{item.category}</Text>
            </View>
            <Text style={styles.coordinates}>
              📍 {formatCoordinates(item.latitude, item.longitude)}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.timestamp}>{item.savedAt}</Text>
              <TouchableOpacity style={styles.planBtn}>
                <Text style={styles.planBtnText}>Plan Meetup Here</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  categoryBadge: {
    color: "#38bdf8",
    fontSize: 11,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coordinates: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(51, 65, 85, 0.4)",
  },
  timestamp: {
    color: "#64748b",
    fontSize: 11,
  },
  planBtn: {
    backgroundColor: "#0284c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
});
