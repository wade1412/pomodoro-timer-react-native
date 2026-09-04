import {
  longBreakPhaseDuration,
  shortBreakPhaseDuration,
} from "@/constants/timer.constants";
import { POMODORO_INITIAL_STATE, PomodoroState } from "@/constants/types";
import { reducer } from "@/state/pomodoroReducer";
import { ACTION_LABELS } from "@/state/reducer.helpers";
import { describe, expect, it } from "@jest/globals";

const nowSeconds = 1000;

describe("state reducer function", () => {
  it("starts the timer correctly", () => {
    const newState = reducer(POMODORO_INITIAL_STATE, {
      type: ACTION_LABELS.startOrResumePhase,
      nowSeconds,
    });

    const expectedResult: PomodoroState = {
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds:
          nowSeconds + POMODORO_INITIAL_STATE.timerSession.timerDurationSeconds,
        accumulatedActiveSeconds: 0,
        sessionActive: true,
      },
      trackedValues: POMODORO_INITIAL_STATE.trackedValues,
    };

    expect(newState).toEqual(expectedResult);
  });

  it("pauses a running timer and accumulates the active segment", () => {
    const runningState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds:
          nowSeconds + POMODORO_INITIAL_STATE.timerSession.timerDurationSeconds,
        accumulatedActiveSeconds: 0,
        sessionActive: true,
      },
    };

    const newState = reducer(runningState, {
      type: ACTION_LABELS.pausePhase,
      nowSeconds: nowSeconds + 300,
    });

    const expectedResult: PomodoroState = {
      ...runningState,
      timerSession: {
        ...runningState.timerSession,
        accumulatedActiveSeconds: Math.min(
          runningState.timerSession.timerDurationSeconds,
          300,
        ),
        status: "paused",
        startedAtSeconds: null,
        endsAtSeconds: null,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("resumes the timer with valid endsAtSeconds", () => {
    const pausedState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        accumulatedActiveSeconds: 5,
        status: "paused",
        startedAtSeconds: null,
        endsAtSeconds: null,
        sessionActive: true,
      },
    };

    const newState = reducer(pausedState, {
      type: ACTION_LABELS.startOrResumePhase,
      nowSeconds: nowSeconds,
    });

    const expectedResult: PomodoroState = {
      ...pausedState,
      timerSession: {
        ...pausedState.timerSession,
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds:
          nowSeconds +
          pausedState.timerSession.timerDurationSeconds -
          pausedState.timerSession.accumulatedActiveSeconds,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("reset the timer and tracks the accumulated seconds", () => {
    const runningState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        phase: "focus",
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds:
          nowSeconds + POMODORO_INITIAL_STATE.timerSession.timerDurationSeconds,
        accumulatedActiveSeconds: 0,
        sessionActive: true,
      },
    };

    const newNowSeconds = nowSeconds + 300;

    const newState = reducer(runningState, {
      type: ACTION_LABELS.resetTimer,
      nowSeconds: newNowSeconds,
    });

    const expectedResult: PomodoroState = {
      trackedValues: {
        ...runningState.trackedValues,
        focusSeconds:
          runningState.trackedValues.focusSeconds +
          Math.min(
            runningState.timerSession.timerDurationSeconds,
            newNowSeconds - nowSeconds,
          ),
      },
      timerSession: {
        ...runningState.timerSession,
        accumulatedActiveSeconds: 0,
        status: "ready",
        startedAtSeconds: null,
        endsAtSeconds: null,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("completes the focus and goes into break phase", () => {
    const finishingState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        phase: "focus",
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds:
          nowSeconds + POMODORO_INITIAL_STATE.timerSession.timerDurationSeconds,
        accumulatedActiveSeconds: 0,
        sessionActive: true,
      },
    };

    const newState = reducer(finishingState, {
      type: ACTION_LABELS.completeFocus,
    });

    const expectedResult: PomodoroState = {
      trackedValues: {
        ...finishingState.trackedValues,
        completedRounds: finishingState.trackedValues.completedRounds + 1,
        focusSeconds:
          finishingState.trackedValues.focusSeconds +
          finishingState.timerSession.timerDurationSeconds,
      },
      timerSession: {
        ...finishingState.timerSession,
        currentRoundNumber: finishingState.timerSession.currentRoundNumber + 1,
        phase: "shortBreak",
        status: "ready",
        timerDurationSeconds: shortBreakPhaseDuration,
        accumulatedActiveSeconds: 0,
        breakExtended: false,
        startedAtSeconds: null,
        endsAtSeconds: null,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("goes into longBreak phase on 4th round completion", () => {
    const finishingState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        currentRoundNumber: 3,
        phase: "focus",
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds:
          nowSeconds + POMODORO_INITIAL_STATE.timerSession.timerDurationSeconds,
        accumulatedActiveSeconds: 0,
        sessionActive: true,
      },
    };

    const newState = reducer(finishingState, {
      type: ACTION_LABELS.completeFocus,
    });

    const expectedResult: PomodoroState = {
      trackedValues: {
        ...finishingState.trackedValues,
        completedRounds: finishingState.trackedValues.completedRounds + 1,
        focusSeconds:
          finishingState.trackedValues.focusSeconds +
          finishingState.timerSession.timerDurationSeconds,
      },
      timerSession: {
        ...finishingState.timerSession,
        currentRoundNumber: finishingState.timerSession.currentRoundNumber + 1,
        phase: "longBreak",
        status: "ready",
        timerDurationSeconds: longBreakPhaseDuration,
        accumulatedActiveSeconds: 0,
        breakExtended: false,
        startedAtSeconds: null,
        endsAtSeconds: null,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("ends a running break, tracks elapsed time and marks it completed", () => {
    const runningBreakState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        currentRoundNumber: 1,
        phase: "shortBreak",
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds:
          nowSeconds + POMODORO_INITIAL_STATE.timerSession.timerDurationSeconds,
        accumulatedActiveSeconds: 0,
        sessionActive: true,
      },
    };

    const newNowSeconds = nowSeconds + 300;

    const newState = reducer(runningBreakState, {
      type: ACTION_LABELS.endBreak,
      nowSeconds: newNowSeconds,
    });

    const expectedResult: PomodoroState = {
      trackedValues: {
        ...runningBreakState.trackedValues,
        breakSeconds:
          runningBreakState.trackedValues.breakSeconds +
          Math.min(
            runningBreakState.timerSession.timerDurationSeconds,
            newNowSeconds - nowSeconds,
          ),
      },
      timerSession: {
        ...runningBreakState.timerSession,
        accumulatedActiveSeconds: Math.min(
          runningBreakState.timerSession.timerDurationSeconds,
          300,
        ),
        status: "completed",
        startedAtSeconds: null,
        endsAtSeconds: null,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("adds spent seconds to tracking on end session", () => {
    const runningState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        phase: "focus",
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds:
          nowSeconds + POMODORO_INITIAL_STATE.timerSession.timerDurationSeconds,
        accumulatedActiveSeconds: 0,
        sessionActive: true,
      },
    };

    const newNowSeconds = nowSeconds + 300;

    const newState = reducer(runningState, {
      type: ACTION_LABELS.endSession,
      nowSeconds: newNowSeconds,
    });

    const expectedResult: PomodoroState = {
      trackedValues: {
        ...runningState.trackedValues,
        focusSeconds:
          runningState.trackedValues.focusSeconds +
          Math.min(
            runningState.timerSession.timerDurationSeconds,
            newNowSeconds - nowSeconds,
          ),
      },
      timerSession: POMODORO_INITIAL_STATE.timerSession,
    };

    expect(newState).toEqual(expectedResult);
  });

  it("returns the same state on invalid action", () => {
    const initialState = POMODORO_INITIAL_STATE;

    const newState = reducer(initialState, {
      type: ACTION_LABELS.endBreak,
      nowSeconds,
    });

    expect(newState).toBe(initialState);
  });
});
