import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { RoutingProfile } from "@georynth/domain";

export default function SettingsScreen() {
  const [profile, setProfile] = useState<RoutingProfile>("car");
  const [approximateLocation, setApproximateLocation] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>GS</Text>
        </View>
        <View style={styles.profileMeta}>
          <Text style={styles.userName}>G Siddhu</Text>
          <Text style={styles.userEmail}>Hyderabad, India</Text>
        </View>
      </View>

      {/* Default Transport Preference */}
      <Text style={styles.sectionHeader}>DEFAULT TRANSPORT MODE</Text>
      <View style={styles.sectionCard}>
        {(["car", "bike", "foot"] as RoutingProfile[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => setProfile(mode)}
            style={[styles.rowOption, profile === mode && styles.rowOptionActive]}
          >
            <Text style={styles.optionLabel}>
              {mode === "car" ? "🚗 Driving (Car)" : mode === "bike" ? "🏍️ Two-Wheeler / Bike" : "🚶 Walking / Transit"}
            </Text>
            {profile === mode && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Privacy & Location Controls */}
      <Text style={styles.sectionHeader}>LOCATION PRIVACY CONTROLS</Text>
      <View style={styles.sectionCard}>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.switchTitle}>Approximate Location Sharing</Text>
            <Text style={styles.switchDesc}>
              Offsets your starting pin by ~500m to preserve private residential privacy.
            </Text>
          </View>
          <Switch
            value={approximateLocation}
            onValueChange={setApproximateLocation}
            thumbColor={approximateLocation ? "#38bdf8" : "#94a3b8"}
            trackColor={{ false: "#334155", true: "#0284c7" }}
          />
        </View>

        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            🛡️ GEORYNTH never tracks your location in the background. Coordinates are only requested when you explicitly choose to share your starting origin for a meetup.
          </Text>
        </View>
      </View>

      {/* System Information */}
      <Text style={styles.sectionHeader}>PLATFORM STATUS</Text>
      <View style={styles.sectionCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Map Provider</Text>
          <Text style={styles.infoVal}>MapTiler Streets v2</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Routing Engine</Text>
          <Text style={styles.infoVal}>GraphHopper Matrix</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Database</Text>
          <Text style={styles.infoVal}>Supabase Cloud (Active)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Mobile Client</Text>
          <Text style={styles.infoVal}>Expo SDK 52 (React Native)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Version</Text>
          <Text style={styles.infoVal}>1.0.0 (Release 2026-11-07)</Text>
        </View>
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
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0284c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  profileMeta: {
    flex: 1,
  },
  userName: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  userEmail: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  sectionCard: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
    overflow: "hidden",
  },
  rowOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 65, 85, 0.3)",
  },
  rowOptionActive: {
    backgroundColor: "rgba(56, 189, 248, 0.08)",
  },
  optionLabel: {
    color: "#f8fafc",
    fontSize: 14,
  },
  checkmark: {
    color: "#38bdf8",
    fontSize: 16,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  switchText: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
  },
  switchDesc: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  infoBanner: {
    backgroundColor: "rgba(6, 182, 212, 0.08)",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(6, 182, 212, 0.2)",
  },
  infoText: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 65, 85, 0.3)",
  },
  infoKey: {
    color: "#94a3b8",
    fontSize: 13,
  },
  infoVal: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
  },
});
