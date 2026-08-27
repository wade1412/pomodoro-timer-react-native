import { theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import ProgressBar from "./ProgressBar";
import TrackedMetrics from "./TrackedMetrics";

const { colors, typography, spacing, radius } = theme;

export default function DailyGoalCard() {
  return (
    <View style={styles.goalCardContainer}>
      {/* Header: Section Caption and Minutes to Goal */}
      <View style={styles.goalCardHeaderContainer}>
        <Text style={styles.goalCardTitle}>DAILY GOAL</Text>
        <Text style={styles.goalMinutes}>25/100 min</Text>
      </View>

      <ProgressBar />

      <TrackedMetrics />
    </View>
  );
}

const styles = StyleSheet.create({
  goalCardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  goalCardHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalCardTitle: {
    ...typography.body,
    fontWeight: "500",
    color: colors.textSecondary,
    letterSpacing: 1.2,
  },
  goalMinutes: {
    ...typography.body,
    color: colors.focus,
    letterSpacing: 1.2,
  },
});
