import {
  breakExtensionDuration,
  focusPhaseDuration,
  longBreakPhaseDuration,
  shortBreakPhaseDuration,
} from "@/constants/timer.constants";
import { DEFAULT_TIMER_SESSION, PomodoroState } from "@/constants/types";
import {
  ACTION_LABELS,
  getReconciledElapsedSeconds,
  ReducerAction,
  validateReducerAction,
  validateTimerStatus,
} from "@/state/reducer.helpers";
import { getEffectiveElapsedSeconds } from "@/utils/timer";

export function reducer(
  state: PomodoroState,
  action: ReducerAction,
): PomodoroState {
  switch (action.type) {
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

      const remainingDuration =
        state.timerSession.timerDurationSeconds -
        state.timerSession.accumulatedActiveSeconds;
      const newEndsAt = action.nowSeconds + remainingDuration;

      return {
        ...state,
        timerSession: {
          ...state.timerSession,
          startedAtSeconds: action.nowSeconds,
          endsAtSeconds: newEndsAt,
          status: "running",
          sessionActive: true,
        },
      };
    }

    case ACTION_LABELS.pausePhase: {
      if (
        !validateTimerStatus(state.timerSession) ||
        !validateReducerAction(state.timerSession, ACTION_LABELS.pausePhase)
      ) {
        return state;
      }

      if (!state.timerSession.startedAtSeconds) {
        return state;
      }

      const newAccumulatedSeconds = getReconciledElapsedSeconds(
        state.timerSession,
        action.nowSeconds,
      );

      return {
        ...state,
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

      const isRunning = state.timerSession.status === "running";
      const isFocusPhase = state.timerSession.phase === "focus";
      const defaultPhaseDuration = isFocusPhase
        ? focusPhaseDuration
        : state.timerSession.phase === "longBreak"
          ? longBreakPhaseDuration
          : shortBreakPhaseDuration;

      // Calculate accumulated seconds for running status; for paused get it from the state
      const newAccumulatedSeconds =
        isRunning && state.timerSession.startedAtSeconds !== null
          ? getEffectiveElapsedSeconds(state.timerSession, action.nowSeconds)
          : state.timerSession.accumulatedActiveSeconds;

      const newTrackedValues = isFocusPhase
        ? {
            ...state.trackedValues,
            focusSeconds:
              state.trackedValues.focusSeconds + newAccumulatedSeconds,
          }
        : {
            ...state.trackedValues,
            breakSeconds:
              state.trackedValues.breakSeconds + newAccumulatedSeconds,
          };

      return {
        trackedValues: newTrackedValues,
        timerSession: {
          ...state.timerSession,
          status: "ready",
          timerDurationSeconds: defaultPhaseDuration,
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
        if (!state.timerSession.startedAtSeconds) {
          return state;
        }

        const newAccumulatedSeconds = getReconciledElapsedSeconds(
          state.timerSession,
          action.nowSeconds,
        );

        const remainingDuration = newDuration - newAccumulatedSeconds;
        const newEndsAt = action.nowSeconds + remainingDuration;

        // updating startedAt to reconcile timer
        return {
          ...state,
          timerSession: {
            ...state.timerSession,
            startedAtSeconds: action.nowSeconds,
            accumulatedActiveSeconds: newAccumulatedSeconds,
            breakExtended: true,
            timerDurationSeconds: newDuration,
            endsAtSeconds: newEndsAt,
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

      const newCompletedTrackedRounds = state.trackedValues.completedRounds + 1;
      const newTrackedFocusSeconds =
        state.trackedValues.focusSeconds +
        state.timerSession.timerDurationSeconds;

      // Return next timer phase with "ready"
      return {
        trackedValues: {
          ...state.trackedValues,
          completedRounds: newCompletedTrackedRounds,
          focusSeconds: newTrackedFocusSeconds,
        },
        timerSession: {
          ...state.timerSession,
          currentRoundNumber: newCompletedRounds,
          phase: isLongBreakNext ? "longBreak" : "shortBreak",
          status: "ready",
          timerDurationSeconds: isLongBreakNext
            ? longBreakPhaseDuration
            : shortBreakPhaseDuration,
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

      // Calculate new accumulatedSeconds if its running, get from state if its paused
      const newAccumulatedSeconds = getReconciledElapsedSeconds(
        state.timerSession,
        action.nowSeconds,
      );

      const newTrackedBreakSeconds =
        state.trackedValues.breakSeconds + newAccumulatedSeconds;

      return {
        trackedValues: {
          ...state.trackedValues,
          breakSeconds: newTrackedBreakSeconds,
        },
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

      const newSessionEndsAt = action.nowSeconds + focusPhaseDuration;

      return {
        ...state,
        timerSession: {
          ...state.timerSession,
          phase: "focus",
          status: "running",
          timerDurationSeconds: focusPhaseDuration,
          accumulatedActiveSeconds: 0,
          breakExtended: false,
          sessionActive: true,
          startedAtSeconds: action.nowSeconds,
          endsAtSeconds: newSessionEndsAt,
        },
      };
    }

    case ACTION_LABELS.endSession:
      if (
        !validateTimerStatus(state.timerSession) ||
        !validateReducerAction(state.timerSession, ACTION_LABELS.endSession)
      ) {
        return state;
      }

      const isFocusPhase = state.timerSession.phase === "focus";

      // Calculate new accumulated seconds on running, get it from state on paused
      const newAccumulatedSeconds = getReconciledElapsedSeconds(
        state.timerSession,
        action.nowSeconds,
      );

      // On completed status return previous tracked valued to avoid duplicate tracking
      const newTrackedValues =
        state.timerSession.status === "completed"
          ? { ...state.trackedValues }
          : isFocusPhase
            ? {
                ...state.trackedValues,
                focusSeconds:
                  state.trackedValues.focusSeconds + newAccumulatedSeconds,
              }
            : {
                ...state.trackedValues,
                breakSeconds:
                  state.trackedValues.breakSeconds + newAccumulatedSeconds,
              };

      return {
        trackedValues: newTrackedValues,
        timerSession: DEFAULT_TIMER_SESSION,
      };

    default:
      return state;
  }
}
