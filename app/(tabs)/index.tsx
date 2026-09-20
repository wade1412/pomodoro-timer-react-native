import DailyGoalCard from "@/components/GoalProgressBar/DailyGoalCard";
import CircularTimer from "@/components/Timer/CircularTimer";
import TimerControls from "@/components/Timer/TimerControls";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { theme } from "@/constants/theme";
import { useNowSeconds } from "@/hooks/useNowSeconds";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { usePomodoroContext } from "@/providers/PomodoroProvider";
import { ACTION_LABELS } from "@/state/reducer.helpers";
import { getLocalDateKey } from "@/state/tracking.helpers";
import { getEffectiveElapsedSeconds } from "@/utils/timer";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, spacing } = theme;
export default function FocusScreen() {
  const {
    dailyGoalSeconds,
    focusDurationSeconds,
    shortBreakDurationSeconds,
    longBreakDurationSeconds,
  } = useAppSettings();
  const { state, dispatch } = usePomodoroContext();
  const { nowSeconds, refreshNow } = useNowSeconds(
    state.timerSession.status === "running" ? 250 : 30_000,
  );

  const getConfiguredPhaseDuration = () => {
    if (state.timerSession.phase === "focus") return focusDurationSeconds;
    if (state.timerSession.phase === "longBreak")
      return longBreakDurationSeconds;
    return shortBreakDurationSeconds;
  };

  useEffect(() => {
    if (
      state.timerSession.status !== "running" ||
      !state.timerSession.endsAtSeconds
    )
      return;

    if (nowSeconds >= state.timerSession.endsAtSeconds) {
      if (state.timerSession.phase === "focus") {
        dispatch({
          type: ACTION_LABELS.completeFocus,
          nowSeconds,
          shortBreakDurationSeconds,
          longBreakDurationSeconds,
        });
      } else {
        dispatch({ type: ACTION_LABELS.endBreak, nowSeconds });
      }
    }
  }, [
    state.timerSession.status,
    state.timerSession.endsAtSeconds,
    state.timerSession.phase,
    nowSeconds,
    shortBreakDurationSeconds,
    longBreakDurationSeconds,
    dispatch,
  ]);

  const formattedDate = new Date(nowSeconds * 1000).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // ----- Timer Handlers -----
  const runTimerPhase = () => {
    const dateNowSeconds = refreshNow();

    dispatch({
      type: ACTION_LABELS.startOrResumePhase,
      nowSeconds: dateNowSeconds,
      phaseDurationSeconds: getConfiguredPhaseDuration(),
    });
  };

  const pauseTimerPhase = () => {
    const dateNowSeconds = refreshNow();

    dispatch({ type: ACTION_LABELS.pausePhase, nowSeconds: dateNowSeconds });
  };

  const onTimerReset = () => {
    const dateNowSeconds = refreshNow();

    dispatch({
      type: ACTION_LABELS.resetTimer,
      nowSeconds: dateNowSeconds,
      phaseDurationSeconds: getConfiguredPhaseDuration(),
    });
  };

  const onAddBreakTime = () => {
    const dateNowSeconds = refreshNow();

    dispatch({ type: ACTION_LABELS.extendBreak, nowSeconds: dateNowSeconds });
  };

  const onBreakEnd = () => {
    const dateNowSeconds = refreshNow();

    dispatch({ type: ACTION_LABELS.endBreak, nowSeconds: dateNowSeconds });
  };

  const onNewSessionRound = () => {
    const dateNowSeconds = refreshNow();

    dispatch({
      type: ACTION_LABELS.newSessionRound,
      nowSeconds: dateNowSeconds,
      focusDurationSeconds,
    });
  };

  const onEndSession = () => {
    const dateNowSeconds = refreshNow();
    dispatch({
      type: ACTION_LABELS.endSession,
      nowSeconds: dateNowSeconds,
      focusDurationSeconds,
    });
  };

  const timerButtonText = [
    state.timerSession.status === "ready"
      ? "Start"
      : state.timerSession.status === "paused"
        ? "Resume"
        : "Pause",
    state.timerSession.phase === "focus" ? "Focus" : "Break",
  ].join(" ");

  const effectiveElapsedSeconds = getEffectiveElapsedSeconds(
    state.timerSession,
    nowSeconds,
  );

  const tabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarHeight + spacing.sm,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentColumn}>
          {/* Header */}
          <ScreenHeader title="Focus" subtitle={formattedDate} />

          {/* Tracking Area */}
          <DailyGoalCard
            state={state}
            elapsedSeconds={effectiveElapsedSeconds}
            dailyGoalSeconds={dailyGoalSeconds}
            dateKey={getLocalDateKey(nowSeconds)}
          />

          {/* Timer Area */}
          <View style={styles.timerAndActionsContainer}>
            <View style={styles.timerSlot}>
              <CircularTimer
                timerSession={state.timerSession}
                elapsedSeconds={effectiveElapsedSeconds}
              />
            </View>

            <View style={styles.controlsSlot}>
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
      </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  contentColumn: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    maxWidth: 320,
    gap: spacing.md,
  },
  timerAndActionsContainer: {
    flex: 1,
    minHeight: 0,
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  timerSlot: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  controlsSlot: {
    width: "100%",
    minHeight: 180,
    justifyContent: "flex-start",
  },
});
