import { theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import VerticalDivider from "../shared/VerticalDivider";

const { colors, spacing, typography } = theme;

export default function TrackedMetrics() {
  return (
    <View style={styles.trackingContainer}>
      <View style={styles.trackingCell}>
        <Text style={styles.trackingRoundsNumber}>0</Text>
        <Text style={styles.baseText}>rounds</Text>
      </View>

      <VerticalDivider />

      <View style={styles.trackingCell}>
        <Text style={styles.trackingFocusNumber}>10</Text>
        <Text style={styles.baseText}>focus min</Text>
      </View>

      <VerticalDivider />

      <View style={styles.trackingCell}>
        <Text style={styles.trackingBreakNumber}>5</Text>
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
    gap: spacing.xs,
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
