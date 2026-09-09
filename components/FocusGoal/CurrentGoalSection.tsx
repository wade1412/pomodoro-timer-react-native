import { theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

const { spacing, colors, radius, typography } = theme;

function formatIntoHoursAndMinutes(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatIntoMinutes(goalSeconds: number) {
  return Math.floor(goalSeconds / 60);
}

export default function CurrentGoalSection({
  dailyGoalSeconds,
}: {
  dailyGoalSeconds: number;
}) {
  return (
    <View style={styles.currentGoalSection}>
      <Text style={styles.currentGoalTitle}>CURRENT GOAL</Text>
      <Text style={styles.currentGoalTime}>
        {formatIntoHoursAndMinutes(dailyGoalSeconds)}
      </Text>
      <Text
        style={styles.currentGoalTitle}
      >{`${formatIntoMinutes(dailyGoalSeconds)} minutes per day`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  currentGoalSection: {
    width: "100%",
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xxs,
  },
  currentGoalTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  currentGoalTime: {
    ...typography.timer,
    color: colors.focus,
  },
});
