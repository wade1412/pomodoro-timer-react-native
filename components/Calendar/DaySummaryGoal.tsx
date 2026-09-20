import { theme } from "@/constants/theme";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { colors, typography, spacing, radius } = theme;

interface DaySummaryGoalProps {
  focusSeconds: number;
  dailyGoalSeconds: number;
}

export default function DaySummaryGoal({
  focusSeconds,
  dailyGoalSeconds,
}: DaySummaryGoalProps) {
  const displayFocusMinutes = Math.floor(focusSeconds / 60);
  const progress = Math.max(0, Math.min(focusSeconds / dailyGoalSeconds, 1));
  const hasReached = focusSeconds >= dailyGoalSeconds;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 400,
      reduceMotion: ReduceMotion.System,
    });
  }, [animatedProgress, progress]);

  const animatedWidth = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View style={[styles.goalCard, hasReached && styles.goalCardReached]}>
      <View style={styles.headerRow}>
        <View style={styles.goalStatusContainer}>
          <Text style={styles.goalTitle}>DAILY GOAL</Text>

          <View
            style={[
              styles.goalStatusBadge,
              hasReached && styles.reachedBadge,
            ]}
          >
            <Text
              style={[
                styles.goalStatusText,
                hasReached && styles.reachedText,
              ]}
            >
              {hasReached ? "Reached ✓" : "Not reached"}
            </Text>
          </View>
        </View>

        <Text style={[styles.goalMinutes, hasReached && styles.reachedText]}>
          {`${displayFocusMinutes}/${Math.floor(dailyGoalSeconds / 60)} min`}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressBarFill,
            animatedWidth,
            hasReached && styles.progressBarReached,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  goalCardReached: {
    borderColor: colors.breakPressed,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  goalStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 1,
  },
  goalTitle: {
    ...typography.body,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  goalStatusBadge: {
    borderRadius: radius.round,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.textMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  goalStatusText: {
    ...typography.sectionTitle,
    color: colors.textSecondary,
  },
  reachedBadge: {
    borderColor: colors.breakPressed,
    backgroundColor: colors.breakSoft,
  },
  reachedText: {
    color: colors.break,
  },
  goalMinutes: {
    ...typography.body,
    color: colors.focus,
    flexShrink: 0,
  },
  progressBar: {
    height: spacing.sm,
    backgroundColor: colors.progressTrack,
    borderRadius: radius.round,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.focus,
  },
  progressBarReached: {
    backgroundColor: colors.break,
  },
});
