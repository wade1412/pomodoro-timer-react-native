import DailyGoalCard from "@/components/GoalProgressBar/DailyGoalCard";
import CircularTimer from "@/components/Timer/CircularTimer";
import TimerControls from "@/components/Timer/TimerControls";
import { theme } from "@/constants/theme";
import { TimerPhase, TimerStatus } from "@/constants/types";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing, radius } = theme;

export default function FocusScreen() {
  const [timerPhase, setTimerPhase] = useState<TimerPhase>("break");
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("ready");

  const isFocusPhase = timerPhase === "focus";

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const onTimerButtonPress = () => {
    setTimerStatus((prev) => (prev === "running" ? "paused" : "running"));
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
          <CircularTimer
            durationSeconds={1500}
            secondsRemaining={1500}
            phase={timerPhase}
            status={timerStatus}
          />

          <TimerControls
            onPress={onTimerButtonPress}
            buttonText={timerButtonText}
            isFocusPhase={isFocusPhase}
          />
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
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.lg,
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
});
