import { breakExtensionDuration } from "@/constants/timer.constants";
import {
  DEFAULT_TIMER_SESSION,
  PomodoroState,
  TrackingDelta,
} from "@/constants/types";
import {
  ACTION_LABELS,
  ReducerAction,
  validateReducerAction,
  validateTimerStatus,
} from "@/state/reducer.helpers";
import {
  getLocalDateKey,
  updateTrackingHistory,
} from "@/state/tracking.helpers";
import { getEffectiveElapsedSeconds } from "@/utils/timer";

const updateHistoryForCurrentSegment = (
  state: PomodoroState,
  nowSeconds: number,
  completedRounds = 0,
) => {
  const reconciledSeconds = getEffectiveElapsedSeconds(
    state.timerSession,
    nowSeconds,
  );
  const newSegmentSeconds =
    state.timerSession.status === "running"
      ? Math.max(
          0,
          reconciledSeconds - state.timerSession.accumulatedActiveSeconds,
        )
      : 0;

  if (newSegmentSeconds === 0 && completedRounds === 0) {
    return state.trackingHistory;
  }

  const isFocusPhase = state.timerSession.phase === "focus";
  const delta: TrackingDelta = {
    completedRounds,
    focusSeconds: isFocusPhase ? newSegmentSeconds : 0,
    breakSeconds: isFocusPhase ? 0 : newSegmentSeconds,
  };

  return updateTrackingHistory(
    state.trackingHistory,
    getLocalDateKey(nowSeconds),
    delta,
    nowSeconds,
  );
};

export function reducer(
  state: PomodoroState,
  action: ReducerAction,
): PomodoroState {
  switch (action.type) {
    case ACTION_LABELS.hydratePomodoroState: {
      return action.state;
    }

    case ACTION_LABELS.hydrateTrackingHistory: {
      return { ...state, trackingHistory: action.trackingHistory };
    }

    case ACTION_LABELS.startOrResumePhase: {
      if (
        !validateTimerStatus(state.timerSession) ||
        !validateReducerAction(
          state.timerSession,
          ACTION_LABELS.startOrResumePhase,
        )
      ) {
        return state;
      }

      const phaseDurationSeconds =
        state.timerSession.status === "ready"
          ? action.phaseDurationSeconds
          : state.timerSession.timerDurationSeconds;
      const remainingDuration =
        phaseDurationSeconds - state.timerSession.accumulatedActiveSeconds;

      return {
        ...state,
        timerSession: {
          ...state.timerSession,
          timerDurationSeconds: phaseDurationSeconds,
          startedAtSeconds: action.nowSeconds,
          endsAtSeconds: action.nowSeconds + remainingDuration,
          status: "running",
          sessionActive: true,
        },
      };
    }

    case ACTION_LABELS.pausePhase: {
      if (
        !validateTimerStatus(state.timerSession) ||
        !validateReducerAction(state.timerSession, ACTION_LABELS.pausePhase) ||
        state.timerSession.startedAtSeconds === null
      ) {
        return state;
      }

      const newAccumulatedSeconds = getEffectiveElapsedSeconds(
        state.timerSession,
        action.nowSeconds,
      );

      return {
        trackingHistory: updateHistoryForCurrentSegment(
          state,
          action.nowSeconds,
        ),
        timerSession: {
          ...state.timerSession,
          accumulatedActiveSeconds: newAccumulatedSeconds,
          status: "paused",
          startedAtSeconds: null,
          endsAtSeconds: null,
        },
      };
    }

    case ACTION_LABELS.resetTimer: {
      if (
        !validateTimerStatus(state.timerSession) ||
        !validateReducerAction(state.timerSession, ACTION_LABELS.resetTimer)
      ) {
        return state;
      }

      return {
        trackingHistory: updateHistoryForCurrentSegment(
          state,
          action.nowSeconds,
        ),
        timerSession: {
          ...state.timerSession,
          status: "ready",
          timerDurationSeconds: action.phaseDurationSeconds,
          accumulatedActiveSeconds: 0,
          breakExtended: false,
          startedAtSeconds: null,
          endsAtSeconds: null,
        },
      };
    }

    case ACTION_LABELS.extendBreak: {
      if (
        !validateTimerStatus(state.timerSession) ||
        !validateReducerAction(state.timerSession, ACTION_LABELS.extendBreak) ||
        state.timerSession.breakExtended
      ) {
        return state;
      }

      const newDuration =
        state.timerSession.timerDurationSeconds + breakExtensionDuration;

      if (state.timerSession.status === "running") {
        if (state.timerSession.startedAtSeconds === null) return state;

        const newAccumulatedSeconds = getEffectiveElapsedSeconds(
          state.timerSession,
          action.nowSeconds,
        );

        return {
          trackingHistory: updateHistoryForCurrentSegment(
            state,
            action.nowSeconds,
          ),
          timerSession: {
            ...state.timerSession,
            startedAtSeconds: action.nowSeconds,
            accumulatedActiveSeconds: newAccumulatedSeconds,
            breakExtended: true,
            timerDurationSeconds: newDuration,
            endsAtSeconds:
              action.nowSeconds + newDuration - newAccumulatedSeconds,
          },
        };
      }

      return {
        ...state,
        timerSession: {
          ...state.timerSession,
          breakExtended: true,
          timerDurationSeconds: newDuration,
        },
      };
    }

    case ACTION_LABELS.completeFocus: {
      if (
        !validateTimerStatus(state.timerSession) ||
        !validateReducerAction(state.timerSession, ACTION_LABELS.completeFocus)
      ) {
        return state;
      }

      const newCompletedRounds = state.timerSession.currentRoundNumber + 1;
      const isLongBreakNext = newCompletedRounds % 4 === 0;

      return {
        trackingHistory: updateHistoryForCurrentSegment(
          state,
          action.nowSeconds,
          1,
        ),
        timerSession: {
          ...state.timerSession,
          currentRoundNumber: newCompletedRounds,
          phase: isLongBreakNext ? "longBreak" : "shortBreak",
          status: "ready",
          timerDurationSeconds: isLongBreakNext
            ? action.longBreakDurationSeconds
            : action.shortBreakDurationSeconds,
          accumulatedActiveSeconds: 0,
          breakExtended: false,
          startedAtSeconds: null,
          endsAtSeconds: null,
        },
      };
    }

    case ACTION_LABELS.endBreak: {
      if (
        !validateTimerStatus(state.timerSession) ||
        !validateReducerAction(state.timerSession, ACTION_LABELS.endBreak)
      ) {
        return state;
      }

      const newAccumulatedSeconds = getEffectiveElapsedSeconds(
        state.timerSession,
        action.nowSeconds,
      );

      return {
        trackingHistory: updateHistoryForCurrentSegment(
          state,
          action.nowSeconds,
        ),
        timerSession: {
          ...state.timerSession,
          status: "completed",
          accumulatedActiveSeconds: newAccumulatedSeconds,
          breakExtended: false,
          startedAtSeconds: null,
          endsAtSeconds: null,
        },
      };
    }

    case ACTION_LABELS.newSessionRound: {
      if (
        !validateTimerStatus(state.timerSession) ||
        !validateReducerAction(
          state.timerSession,
          ACTION_LABELS.newSessionRound,
        )
      ) {
        return state;
      }

      return {
        ...state,
        timerSession: {
          ...state.timerSession,
          phase: "focus",
          status: "running",
          timerDurationSeconds: action.focusDurationSeconds,
          accumulatedActiveSeconds: 0,
          breakExtended: false,
          sessionActive: true,
          startedAtSeconds: action.nowSeconds,
          endsAtSeconds: action.nowSeconds + action.focusDurationSeconds,
        },
      };
    }

    case ACTION_LABELS.endSession: {
      if (
        !validateTimerStatus(state.timerSession) ||
        !validateReducerAction(state.timerSession, ACTION_LABELS.endSession)
      ) {
        return state;
      }

      return {
        trackingHistory: updateHistoryForCurrentSegment(
          state,
          action.nowSeconds,
        ),
        timerSession: {
          ...DEFAULT_TIMER_SESSION,
          timerDurationSeconds: action.focusDurationSeconds,
        },
      };
    }

    default:
      return state;
  }
}
