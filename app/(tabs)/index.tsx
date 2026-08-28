import DailyGoalCard from "@/components/GoalProgressBar/DailyGoalCard";
import CircularTimer from "@/components/Timer/CircularTimer";
import TimerControls from "@/components/Timer/TimerControls";
import { theme } from "@/constants/theme";
import {
  focusPhaseDuration,
  shortBreakPhaseDuration,
} from "@/constants/timer.constants";
import { TimerPhase, TimerStatus } from "@/constants/types";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing, radius } = theme;

export default function FocusScreen() {
  const [timerPhase, setTimerPhase] = useState<TimerPhase>("break");
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("ready");
  const [timerDuration, setTimerDuration] = useState(focusPhaseDuration);

  const isFocusPhase = timerPhase === "focus";

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Timer Handlers
  const onStartButtonPress = () => {
    setTimerStatus((prev) => (prev === "running" ? "paused" : "running"));
  };
  const onResetButtonPress = () => {
    setTimerDuration(
      isFocusPhase ? focusPhaseDuration : shortBreakPhaseDuration,
    );
  };

  const timerButtonText = [
    timerStatus === "ready"
      ? "Start"
      : timerStatus === "paused"
        ? "Resume"
        : "Pause",
    timerPhase === "focus" ? "Focus" : "Break",
  ].join(" ");

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.mainContainer}>
        <View style={styles.contentColumn}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Focus</Text>

            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          <DailyGoalCard />

          {/* Timer Area */}
          <View style={styles.timerAndActionsContainer}>
            <CircularTimer
              durationSeconds={timerDuration}
              secondsRemaining={timerDuration - 20}
              phase={timerPhase}
              status={timerStatus}
            />

            <TimerControls
              status={timerStatus}
              phase={timerPhase}
              buttonText={timerButtonText}
              onStartPress={onStartButtonPress}
              onReset={onResetButtonPress}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  contentColumn: {
    flex: 1,
    width: "100%",
    maxWidth: 320,
    gap: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    letterSpacing: 1.2,
  },
  timerAndActionsContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing["2xl"],
  },
});
