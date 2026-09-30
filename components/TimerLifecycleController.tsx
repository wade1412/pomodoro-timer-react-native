import { useNowSeconds } from "@/hooks/useNowSeconds";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { usePomodoroContext } from "@/providers/PomodoroProvider";
import { ACTION_LABELS } from "@/state/reducer.helpers";
import { useEffect } from "react";

export default function TimerLifecycleController() {
  const { state, dispatch } = usePomodoroContext();
  const { shortBreakDurationSeconds, longBreakDurationSeconds } =
    useAppSettings();

  const refreshIntervalMs =
    state.timerSession.status === "running" ? 1_000 : 30_000;

  const { nowSeconds } = useNowSeconds(refreshIntervalMs);

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

  return null;
}
