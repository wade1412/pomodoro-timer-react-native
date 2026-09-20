import { theme } from "@/constants/theme";
import { DailyTracking } from "@/constants/types";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface DaySessionSplitProps {
  dailyTracking: DailyTracking;
}

const { colors, spacing, typography, radius } = theme;

export default function DaySessionSplit({
  dailyTracking,
}: DaySessionSplitProps) {
  const { focusSeconds, breakSeconds } = dailyTracking;

  const totalSeconds = focusSeconds + breakSeconds;

  const focusPercentage =
    totalSeconds > 0 ? Math.floor((focusSeconds / totalSeconds) * 100) : 0;
  const breakPercentage = totalSeconds > 0 ? 100 - focusPercentage : 0;
  const animatedFocusPercentage = useSharedValue(0);
  const animatedBreakPercentage = useSharedValue(0);

  useEffect(() => {
    animatedFocusPercentage.value = withTiming(focusPercentage, {
      duration: 400,
      reduceMotion: ReduceMotion.System,
    });
    animatedBreakPercentage.value = withTiming(breakPercentage, {
      duration: 400,
      reduceMotion: ReduceMotion.System,
    });
  }, [
    animatedBreakPercentage,
    animatedFocusPercentage,
    breakPercentage,
    focusPercentage,
  ]);

  const animatedFocusStyle = useAnimatedStyle(() => ({
    width: `${animatedFocusPercentage.value}%`,
  }));
  const animatedBreakStyle = useAnimatedStyle(() => ({
    width: `${animatedBreakPercentage.value}%`,
  }));

  return (
    <View style={styles.sessionContainer}>
      <Text style={styles.sessionHeader}>SESSION SPLIT</Text>

      <View style={styles.splitBar}>
        <Animated.View style={[styles.focusSplit, animatedFocusStyle]} />
        <Animated.View style={[styles.breakSplit, animatedBreakStyle]} />
      </View>

      <View style={styles.splitInfoRow}>
        <Text
          style={[
            styles.splitInfoText,
            focusPercentage > 0 && {
              color: colors.focus,
            },
          ]}
        >{`Focus ${focusPercentage}%`}</Text>
        <Text
          style={[
            styles.splitInfoText,
            breakPercentage > 0 && {
              color: colors.break,
            },
          ]}
        >{`Break ${breakPercentage}%`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sessionContainer: {
    width: "100%",
    flexDirection: "column",
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  sessionHeader: {
    ...typography.sectionTitle,
    color: colors.textMuted,
  },
  splitBar: {
    flexDirection: "row",
    overflow: "hidden",
    height: spacing.sm,
    gap: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  focusSplit: {
    height: "100%",
    backgroundColor: colors.focus,
  },
  breakSplit: {
    height: "100%",
    backgroundColor: colors.break,
  },
  splitInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  splitInfoText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
