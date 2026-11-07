import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { CandidateVenue, formatDuration, formatDistance } from "@georynth/domain";

interface VenueCardProps {
  venue: CandidateVenue;
  isSelected?: boolean;
  hasVoted?: boolean;
  isConfirmed?: boolean;
  onSelect: () => void;
  onVote: () => void;
  onConfirm?: () => void;
  isCreator?: boolean;
}

export function VenueCard({
  venue,
  isSelected,
  hasVoted,
  isConfirmed,
  onSelect,
  onVote,
  onConfirm,
  isCreator,
}: VenueCardProps) {
  const avgMin = Math.round(venue.avgDurationSec / 60);
  const disparityMin = Math.round(venue.disparitySec / 60);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onSelect}
      style={[styles.card, isSelected && styles.cardSelected, isConfirmed && styles.cardConfirmed]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>{venue.name}</Text>
          <Text style={styles.address} numberOfLines={1}>{venue.address}</Text>
        </View>
        {venue.rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {venue.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* Summary Metrics */}
      <View style={styles.metricRow}>
        <View style={styles.metricPill}>
          <Text style={styles.metricLabel}>Avg Travel</Text>
          <Text style={styles.metricValue}>{avgMin} min</Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricLabel}>Max Disparity</Text>
          <Text style={[styles.metricValue, disparityMin <= 10 ? styles.textGreen : styles.textYellow]}>
            ±{disparityMin} min
          </Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricLabel}>Votes</Text>
          <Text style={styles.metricValue}>{venue.voteCount || 0}</Text>
        </View>
      </View>

      {/* Recommendation reason */}
      <Text style={styles.reasonText} numberOfLines={2}>
        {venue.recommendationReason}
      </Text>

      {/* Individual participant times */}
      {venue.participantTimes && venue.participantTimes.length > 0 && (
        <View style={styles.timesContainer}>
          <Text style={styles.timesHeader}>Individual Travel Times:</Text>
          <View style={styles.timesGrid}>
            {venue.participantTimes.map((pt, i) => (
              <View key={i} style={styles.timeItem}>
                <Text style={styles.timeMember} numberOfLines={1}>
                  {pt.memberName || `Friend ${i + 1}`}
                </Text>
                <Text style={styles.timeDuration}>
                  {formatDuration(pt.durationSeconds)} ({formatDistance(pt.distanceMeters)})
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={onVote}
          style={[styles.voteButton, hasVoted && styles.voteButtonActive]}
        >
          <Text style={[styles.voteButtonText, hasVoted && styles.voteButtonTextActive]}>
            {hasVoted ? "✓ Voted" : "Vote for this place"}
          </Text>
        </TouchableOpacity>

        {isCreator && !isConfirmed && onConfirm && (
          <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm Venue</Text>
          </TouchableOpacity>
        )}

        {isConfirmed && (
          <View style={styles.confirmedBadge}>
            <Text style={styles.confirmedBadgeText}>✓ Final Meeting Spot</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
    padding: 14,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: "#06b6d4",
    backgroundColor: "#111c35",
  },
  cardConfirmed: {
    borderColor: "#10b981",
    backgroundColor: "#06251b",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  address: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  ratingText: {
    color: "#fbbf24",
    fontWeight: "700",
    fontSize: 12,
  },
  metricRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  metricPill: {
    flex: 1,
    backgroundColor: "#1e293b",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  metricLabel: {
    color: "#64748b",
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  metricValue: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  textGreen: {
    color: "#10b981",
  },
  textYellow: {
    color: "#fbbf24",
  },
  reasonText: {
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 10,
    fontStyle: "italic",
  },
  timesContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(51, 65, 85, 0.4)",
  },
  timesHeader: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  timesGrid: {
    gap: 4,
  },
  timeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  timeMember: {
    color: "#cbd5e1",
    fontSize: 12,
    flex: 1,
  },
  timeDuration: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    alignItems: "center",
  },
  voteButton: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#3b82f6",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  voteButtonActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#60a5fa",
  },
  voteButtonText: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "600",
  },
  voteButtonTextActive: {
    color: "#ffffff",
  },
  confirmButton: {
    backgroundColor: "#059669",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  confirmedBadge: {
    backgroundColor: "#065f46",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  confirmedBadgeText: {
    color: "#34d399",
    fontSize: 12,
    fontWeight: "700",
  },
});
