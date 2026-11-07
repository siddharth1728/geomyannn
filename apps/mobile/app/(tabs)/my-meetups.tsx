import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";

interface MeetupItem {
  id: string;
  title: string;
  category: string;
  date: string;
  membersCount: number;
  status: "voting" | "confirmed" | "completed";
}

const mockMeetups: MeetupItem[] = [
  {
    id: "hyd-demo-1",
    title: "Hyderabad Weekend Hangout",
    category: "cafe",
    date: "Today, 7:00 PM",
    membersCount: 4,
    status: "voting",
  },
  {
    id: "team-sync-nov",
    title: "Quarterly Team Dinner",
    category: "restaurant",
    date: "Nov 14, 8:30 PM",
    membersCount: 6,
    status: "confirmed",
  },
  {
    id: "gaming-sat",
    title: "Arcade & Board Games",
    category: "entertainment",
    date: "Nov 21, 5:00 PM",
    membersCount: 5,
    status: "voting",
  },
];

export default function MyMeetupsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={mockMeetups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/meetup/[id]",
                params: { id: item.id },
              })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  item.status === "confirmed" ? styles.badgeConfirmed : styles.badgeVoting,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === "confirmed" ? styles.textConfirmed : styles.textVoting,
                  ]}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.cardMeta}>
              <Text style={styles.metaItem}>📅 {item.date}</Text>
              <Text style={styles.metaItem}>👥 {item.membersCount} participants</Text>
              <Text style={styles.metaItem}>🏷️ {item.category}</Text>
            </View>
          </TouchableOpacity>
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
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeVoting: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
  },
  badgeConfirmed: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  textVoting: {
    color: "#38bdf8",
  },
  textConfirmed: {
    color: "#34d399",
  },
  cardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  metaItem: {
    color: "#94a3b8",
    fontSize: 12,
  },
});
