import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { MeetupCategory, MeetupBudget } from "@georynth/domain";

export default function PlanModalScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MeetupCategory>("cafe");
  const [budget, setBudget] = useState<MeetupBudget>("moderate");
  const [maxTravelTime, setMaxTravelTime] = useState("35");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: { id: MeetupCategory; label: string; icon: string }[] = [
    { id: "cafe", label: "Cafe", icon: "☕" },
    { id: "restaurant", label: "Food", icon: "🍽️" },
    { id: "cinema", label: "Movies", icon: "🎬" },
    { id: "activity", label: "Activities", icon: "🎯" },
    { id: "sports", label: "Sports", icon: "⚽" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
  ];

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert("Title Required", "Please enter a title for your meetup.");
      return;
    }

    setIsSubmitting(true);

    // Navigate into the live meetup cockpit
    setTimeout(() => {
      setIsSubmitting(false);
      router.replace({
        pathname: "/meetup/[id]",
        params: { id: "hyd-demo-1" },
      });
    }, 600);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Plan a New Meetup</Text>
      <Text style={styles.subheading}>
        Set up the hangout and invite friends to find the fairest spot.
      </Text>

      {/* Meetup Title */}
      <Text style={styles.fieldLabel}>MEETUP TITLE</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Hyderabad Weekend Hangout"
        placeholderTextColor="#64748b"
        value={title}
        onChangeText={setTitle}
      />

      {/* Category Selection */}
      <Text style={styles.fieldLabel}>ACTIVITY CATEGORY</Text>
      <View style={styles.grid}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setCategory(c.id)}
            style={[styles.gridItem, category === c.id && styles.gridItemActive]}
          >
            <Text style={styles.gridIcon}>{c.icon}</Text>
            <Text style={[styles.gridText, category === c.id && styles.gridTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Budget Preference */}
      <Text style={styles.fieldLabel}>BUDGET PREFERENCE</Text>
      <View style={styles.row}>
        {(["budget", "moderate", "premium"] as MeetupBudget[]).map((b) => (
          <TouchableOpacity
            key={b}
            onPress={() => setBudget(b)}
            style={[styles.budgetBtn, budget === b && styles.budgetBtnActive]}
          >
            <Text style={[styles.budgetText, budget === b && styles.budgetTextActive]}>
              {b === "budget" ? "₹ Budget" : b === "moderate" ? "₹₹ Moderate" : "₹₹₹ Premium"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Max Travel Time Limit */}
      <Text style={styles.fieldLabel}>MAX TRAVEL TIME CAP (MINUTES)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={maxTravelTime}
        onChangeText={setMaxTravelTime}
        placeholder="35"
        placeholderTextColor="#64748b"
      />

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleCreate}
        disabled={isSubmitting}
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? "Generating Meetup..." : "Create Meetup & Invite Friends →"}
        </Text>
      </TouchableOpacity>
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
  heading: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
  },
  subheading: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  fieldLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#f8fafc",
    fontSize: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem: {
    width: "31%",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  gridItemActive: {
    borderColor: "#0284c7",
    backgroundColor: "rgba(2, 132, 199, 0.15)",
  },
  gridIcon: {
    fontSize: 20,
  },
  gridText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  gridTextActive: {
    color: "#38bdf8",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  budgetBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  budgetBtnActive: {
    borderColor: "#0284c7",
    backgroundColor: "rgba(2, 132, 199, 0.15)",
  },
  budgetText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  budgetTextActive: {
    color: "#38bdf8",
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#0284c7",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 30,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
