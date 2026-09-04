import { theme } from "@/constants/theme";
import { dailyGoalSecondsExample } from "@/constants/timer.constants";
import { PomodoroState } from "@/constants/types";
import { StyleSheet, Text, View } from "react-native";
import TrackedMetrics from "./TrackedMetrics";

const { colors, typography, spacing, radius } = theme;

interface DailyGoalCardProps {
  state: PomodoroState;
  elapsedSeconds: number;
}

export default function DailyGoalCard({
  state,
  elapsedSeconds,
}: DailyGoalCardProps) {
  const { trackedValues, timerSession } = state;
  const { breakSeconds, completedRounds, focusSeconds } = trackedValues;

  const totalFocusSeconds =
    timerSession.phase === "focus" && timerSession.status !== "completed"
      ? focusSeconds + elapsedSeconds
      : focusSeconds;
  const displayFocusMinutes = Math.floor(totalFocusSeconds / 60);

  const totalBreakSeconds =
    timerSession.phase !== "focus" && timerSession.status !== "completed"
      ? breakSeconds + elapsedSeconds
      : breakSeconds;
  const displayBreakMinutes = Math.floor(totalBreakSeconds / 60);

  const progress = Math.max(
    0,
    Math.min(totalFocusSeconds / dailyGoalSecondsExample, 1),
  );

  return (
    <View style={styles.goalCardContainer}>
      {/* Header: Section Caption and Minutes to Goal */}
      <View style={styles.goalCardHeaderContainer}>
        <Text style={styles.goalCardTitle}>DAILY GOAL</Text>
        <Text
          style={styles.goalMinutes}
        >{`${displayFocusMinutes}/${Math.floor(dailyGoalSecondsExample / 60)} min`}</Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
        ></View>
      </View>

      <TrackedMetrics
        rounds={completedRounds}
        focusMinutes={displayFocusMinutes}
        breakMinutes={displayBreakMinutes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  goalCardContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xs,
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
    fontWeight: "400",
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  goalMinutes: {
    ...typography.body,
    color: colors.focus,
  },
  // Progress Bar
  progressBar: {
    height: spacing.xs,
    backgroundColor: colors.progressTrack,
    borderRadius: radius.round,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.focus,
  },
});
