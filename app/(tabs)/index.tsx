import DailyGoalCard from "@/components/GoalProgressBar/DailyGoalCard";
import CircularTimer from "@/components/Timer/CircularTimer";
import TimerControls from "@/components/Timer/TimerControls";
import { theme } from "@/constants/theme";
import { POMODORO_INITIAL_STATE } from "@/constants/types";
import { reducer } from "@/state/pomodoroReducer";
import { ACTION_LABELS } from "@/state/reducer.helpers";
import { getEffectiveElapsedSeconds } from "@/utils/timer";
import { useEffect, useReducer, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing } = theme;

export default function FocusScreen() {
  const [state, dispatch] = useReducer(reducer, POMODORO_INITIAL_STATE);

  const [nowSeconds, setNowSeconds] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (state.timerSession.status !== "running") return;

    const secondInterval = setInterval(() => {
      const newSeconds = Math.floor(Date.now() / 1000);

      setNowSeconds(newSeconds);
    }, 250);

    return () => clearInterval(secondInterval);
  }, [state.timerSession.status]);

  useEffect(() => {
    if (
      state.timerSession.status !== "running" ||
      !state.timerSession.endsAtSeconds
    )
      return;

    if (nowSeconds >= state.timerSession.endsAtSeconds) {
      state.timerSession.phase === "focus" ? onFocusComplete() : onBreakEnd();
    }
  }, [
    state.timerSession.status,
    state.timerSession.endsAtSeconds,
    state.timerSession.phase,
    nowSeconds,
  ]);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // ----- Timer Handlers -----
  const runTimerPhase = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);
    setNowSeconds(dateNowSeconds);

    dispatch({
      type: ACTION_LABELS.startOrResumePhase,
      nowSeconds: dateNowSeconds,
    });
  };

  const pauseTimerPhase = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);

    dispatch({ type: ACTION_LABELS.pausePhase, nowSeconds: dateNowSeconds });
  };

  const onTimerReset = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);

    dispatch({ type: ACTION_LABELS.resetTimer, nowSeconds: dateNowSeconds });
  };

  const onFocusComplete = () => {
    dispatch({ type: ACTION_LABELS.completeFocus });
  };

  const onAddBreakTime = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);
    setNowSeconds(dateNowSeconds);

    dispatch({ type: ACTION_LABELS.extendBreak, nowSeconds: dateNowSeconds });
  };

  const onBreakEnd = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);
    setNowSeconds(dateNowSeconds);

    dispatch({ type: ACTION_LABELS.endBreak, nowSeconds: dateNowSeconds });
  };

  const onNewSessionRound = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);
    setNowSeconds(dateNowSeconds);

    dispatch({
      type: ACTION_LABELS.newSessionRound,
      nowSeconds: dateNowSeconds,
    });
  };

  const onEndSession = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);
    dispatch({ type: ACTION_LABELS.endSession, nowSeconds: dateNowSeconds });
  };

  const timerButtonText = [
    state.timerSession.status === "ready"
      ? "Start"
      : state.timerSession.status === "paused"
        ? "Resume"
        : "Pause",
    state.timerSession.phase === "focus" ? "Focus" : "Break",
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

          {/* Tracking Area */}
          <DailyGoalCard state={state} />

          {/* Timer Area */}
          <View style={styles.timerAndActionsContainer}>
            <CircularTimer
              timerSession={state.timerSession}
              elapsedSeconds={getEffectiveElapsedSeconds(
                state.timerSession,
                nowSeconds,
              )}
            />

            <TimerControls
              timerSession={state.timerSession}
              buttonText={timerButtonText}
              onRunTimerPhase={runTimerPhase}
              onPauseTimerPhase={pauseTimerPhase}
              onTimerReset={onTimerReset}
              onAddBreakTime={onAddBreakTime}
              onBreakComplete={onBreakEnd}
              onNewSessionRound={onNewSessionRound}
              onEndSession={onEndSession}
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
