import { theme } from "@/constants/theme";
import { DailyTracking } from "@/constants/types";
import { StyleSheet, Text, View } from "react-native";

interface DayTrackingMetricsSummaryProps {
  dailyTracking: DailyTracking;
}

const { colors, spacing, radius, typography } = theme;

export default function DayTrackingMetricsSummary({
  dailyTracking,
}: DayTrackingMetricsSummaryProps) {
  const { focusSeconds, breakSeconds, completedRounds } = dailyTracking;
  const focusMinutes = Math.floor(focusSeconds / 60);
  const breakMinutes = Math.floor(breakSeconds / 60);

  return (
    <View style={styles.metricsContainer}>
      <View style={styles.metricBox}>
        <Text style={styles.metricCaption}>FOCUS</Text>

        <Text style={[styles.metricNumber, { color: colors.focus }]}>
          {focusMinutes}
        </Text>

        <Text style={styles.metricCaption}>minutes</Text>
      </View>

      <View style={styles.metricBox}>
        <Text style={styles.metricCaption}>BREAK</Text>

        <Text style={[styles.metricNumber, { color: colors.break }]}>
          {breakMinutes}
        </Text>

        <Text style={styles.metricCaption}>minutes</Text>
      </View>

      <View style={styles.metricBox}>
        <Text style={styles.metricCaption}>ROUNDS</Text>

        <Text style={[styles.metricNumber, { color: colors.textPrimary }]}>
          {completedRounds}
        </Text>

        <Text style={styles.metricCaption}>rounds</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metricsContainer: {
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  metricBox: {
    width: "31%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    minHeight: 100,
    flexDirection: "column",
    padding: spacing.md,
  },
  metricCaption: {
    ...typography.sectionTitle,
    color: colors.textMuted,
  },
  metricNumber: {
    ...typography.metric,
    paddingVertical: spacing.xs,
  },
});
