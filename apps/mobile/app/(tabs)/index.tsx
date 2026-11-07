import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const handleLaunchDemo = () => {
    router.push({
      pathname: "/meetup/[id]",
      params: { id: "hyd-demo-1" },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Brand Header */}
      <View style={styles.brandHero}>
        <View style={styles.brandPill}>
          <Text style={styles.brandPillDot}>●</Text>
          <Text style={styles.brandPillText}>GEOSPATIAL INTELLIGENCE</Text>
        </View>
        <Text style={styles.brandTitle}>GEORYNTH</Text>
        <Text style={styles.brandTagline}>Find a place everyone can reach.</Text>
        <Text style={styles.brandSubtitle}>Less planning. More meeting.</Text>
      </View>

      {/* 3 Core Hero Actions */}
      <View style={styles.heroActions}>
        {/* Action 1: Plan a Meetup */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/plan-modal")}
          style={[styles.actionCard, styles.actionCardPrimary]}
        >
          <View style={styles.actionIconContainerPrimary}>
            <Text style={styles.actionIcon}>🧭</Text>
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitlePrimary}>Plan a Meetup</Text>
            <Text style={styles.actionDescPrimary}>
              Set up a group hangout, invite friends, and discover fair meeting spots.
            </Text>
          </View>
          <Text style={styles.actionArrowPrimary}>→</Text>
        </TouchableOpacity>

        {/* Action 2: Join a Meetup */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/join-modal")}
          style={styles.actionCard}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>🎟️</Text>
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Join a Meetup</Text>
            <Text style={styles.actionDesc}>
              Enter a 6-character invite code to drop your voluntary location pin.
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        {/* Action 3: Explore Nearby */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/(tabs)/explore")}
          style={styles.actionCard}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>🗺️</Text>
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Explore Nearby</Text>
            <Text style={styles.actionDesc}>
              Browse top restaurants, cafes, and attractions on the live vector map.
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Hyderabad 4-Origin Demo */}
      <View style={styles.demoCard}>
        <View style={styles.demoHeader}>
          <Text style={styles.demoBadge}>LIVE TEST SCENARIO</Text>
          <Text style={styles.demoTitle}>Hyderabad 4-Friend Meetup</Text>
        </View>
        <Text style={styles.demoDesc}>
          Test GraphHopper Matrix & fairness routing with 4 real origins:
          {"\n"}• Aarav (Kukatpally)
          {"\n"}• Diya (Secunderabad)
          {"\n"}• Rohan (Mehdipatnam)
          {"\n"}• Ananya (Dilsukhnagar)
        </Text>
        <TouchableOpacity onPress={handleLaunchDemo} style={styles.demoButton}>
          <Text style={styles.demoButtonText}>Launch Hyderabad Scenario →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  brandHero: {
    marginBottom: 24,
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
    marginBottom: 10,
  },
  brandPillDot: {
    color: "#06b6d4",
    fontSize: 8,
    marginRight: 6,
  },
  brandPillText: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  brandTitle: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  brandTagline: {
    color: "#38bdf8",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  brandSubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 2,
  },
  heroActions: {
    gap: 14,
    marginBottom: 28,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.8)",
  },
  actionCardPrimary: {
    backgroundColor: "#0a2540",
    borderColor: "#0284c7",
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionIconContainerPrimary: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#0369a1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  actionTitlePrimary: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  actionDesc: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  actionDescPrimary: {
    color: "#bae6fd",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  actionArrow: {
    color: "#64748b",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  actionArrowPrimary: {
    color: "#38bdf8",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  demoCard: {
    backgroundColor: "#0b192c",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.4)",
  },
  demoHeader: {
    marginBottom: 6,
  },
  demoBadge: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  demoTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  demoDesc: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    marginVertical: 10,
  },
  demoButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  demoButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
