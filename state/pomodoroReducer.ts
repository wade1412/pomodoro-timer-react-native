import {
  breakExtensionDuration,
  focusPhaseDuration,
  longBreakPhaseDuration,
  shortBreakPhaseDuration,
} from "@/constants/timer.constants";
import { DEFAULT_TIMER_SESSION, PomodoroState } from "@/constants/types";
import {
  ACTION_LABELS,
  ReducerAction,
  validateReducerAction,
  validateTimerStatus,
} from "@/state/reducer.helpers";

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

      const newAccumulatedSeconds =
        state.timerSession.accumulatedActiveSeconds +
        (action.nowSeconds - state.timerSession.startedAtSeconds);

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

      const defaultPhaseDuration =
        state.timerSession.phase === "focus"
          ? focusPhaseDuration
          : state.timerSession.phase === "longBreak"
            ? longBreakPhaseDuration
            : shortBreakPhaseDuration;

      return {
        ...state,
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
        !validateReducerAction(state.timerSession, ACTION_LABELS.extendBreak)
      ) {
        return state;
      }

      const newDuration =
        state.timerSession.timerDurationSeconds + breakExtensionDuration;

      if (state.timerSession.status === "running") {
        if (!state.timerSession.startedAtSeconds) {
          return state;
        }

        const currentAccumulatedSeconds =
          action.nowSeconds - state.timerSession.startedAtSeconds;

        const newAccumulatedSeconds =
          state.timerSession.accumulatedActiveSeconds +
          currentAccumulatedSeconds;
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

      // Return next timer phase with "ready"
      return {
        ...state,
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

      const accumulatedSeconds =
        state.timerSession.status === "running" &&
        state.timerSession.startedAtSeconds
          ? action.nowSeconds -
            state.timerSession.startedAtSeconds +
            state.timerSession.accumulatedActiveSeconds
          : state.timerSession.accumulatedActiveSeconds;

      const newAccumulatedSeconds = Math.min(
        state.timerSession.timerDurationSeconds,
        accumulatedSeconds,
      );

      return {
        ...state,
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
      return {
        ...state,
        timerSession: DEFAULT_TIMER_SESSION,
      };

    default:
      return state;
  }
}
