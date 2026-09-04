import { theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import VerticalDivider from "../shared/VerticalDivider";

const { colors, typography } = theme;

interface TrackedMetricsProps {
  rounds: number;
  focusMinutes: number;
  breakMinutes: number;
}

export default function TrackedMetrics({
  rounds,
  focusMinutes,
  breakMinutes,
}: TrackedMetricsProps) {
  return (
    <View style={styles.trackingContainer}>
      <View style={styles.trackingCell}>
        <Text style={styles.trackingRoundsNumber}>{rounds}</Text>
        <Text style={styles.baseText}>rounds</Text>
      </View>

      <VerticalDivider />

      <View style={styles.trackingCell}>
        <Text style={styles.trackingFocusNumber}>{focusMinutes}</Text>
        <Text style={styles.baseText}>focus min</Text>
      </View>

      <VerticalDivider />

      <View style={styles.trackingCell}>
        <Text style={styles.trackingBreakNumber}>{breakMinutes}</Text>
        <Text style={styles.baseText}>break min</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
