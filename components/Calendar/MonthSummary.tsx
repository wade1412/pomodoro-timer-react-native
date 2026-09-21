import { theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import { MonthlyTracking } from "./calendar.types";

const { colors, typography, spacing, radius } = theme;

interface MonthSummaryProps {
  monthlyTracking: MonthlyTracking;
}

export default function MonthSummary({ monthlyTracking }: MonthSummaryProps) {
  const { monthFocusSeconds, monthActiveDays, monthRoundsCompleted } =
    monthlyTracking;
  const focusMinutes = Math.floor(monthFocusSeconds / 60);

  return (
    <View style={styles.monthSummary}>
      <Text style={styles.summaryTitle}>THIS MONTH</Text>
      <View style={styles.trackingContainer}>
        <View style={styles.trackingCell}>
          <Text style={styles.trackingFocusNumber}>{focusMinutes}</Text>
          <Text style={styles.baseText}>focus min</Text>
        </View>

        <View style={styles.trackingCell}>
          <Text style={styles.trackingRoundsNumber}>
            {monthRoundsCompleted}
          </Text>
          <Text style={styles.baseText}>rounds</Text>
        </View>

        <View style={styles.trackingCell}>
          <Text style={styles.trackingBreakNumber}>{monthActiveDays}</Text>
          <Text style={styles.baseText}>active days</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monthSummary: {
    width: "100%",
    flexDirection: "column",
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.md,
  },
  summaryTitle: {
    ...typography.body,
    fontWeight: "500",
    color: colors.textMuted,
  },
  trackingContainer: {
    flexDirection: "row",
    width: "100%",
  },
  trackingCell: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trackingRoundsNumber: {
    ...typography.metric,
    color: colors.textPrimary,
  },
  trackingFocusNumber: { ...typography.metric, color: colors.focus },
  trackingBreakNumber: { ...typography.metric, color: colors.break },
  baseText: {
    ...typography.body,
    fontWeight: "100",
    color: colors.textSecondary,
  },
});
