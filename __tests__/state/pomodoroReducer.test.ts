import {
  breakExtensionDuration,
  focusPhaseDuration,
  longBreakPhaseDuration,
  shortBreakPhaseDuration,
} from "@/constants/timer.constants";
import {
  DEFAULT_TIMER_SESSION,
  POMODORO_INITIAL_STATE,
  PomodoroState,
} from "@/constants/types";
import { reducer } from "@/state/pomodoroReducer";
import { ACTION_LABELS } from "@/state/reducer.helpers";
import { describe, expect, it } from "@jest/globals";

const nowSeconds = 1000;
const passedSeconds = 300;
const newNowSeconds = nowSeconds + passedSeconds;

describe("state reducer function", () => {
  // ----- Start/Pause/Resume Tests -----
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
      nowSeconds: newNowSeconds,
    });

    const expectedResult: PomodoroState = {
      ...runningState,
      timerSession: {
        ...runningState.timerSession,
        accumulatedActiveSeconds: Math.min(
          runningState.timerSession.timerDurationSeconds,
          passedSeconds,
        ),
        status: "paused",
        startedAtSeconds: null,
        endsAtSeconds: null,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("adds recent accumulated seconds to the stored value on pause", () => {
    const runningState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds:
          nowSeconds + POMODORO_INITIAL_STATE.timerSession.timerDurationSeconds,
        accumulatedActiveSeconds: 50,
        sessionActive: true,
      },
    };

    const newState = reducer(runningState, {
      type: ACTION_LABELS.pausePhase,
      nowSeconds: newNowSeconds,
    });

    const expectedResult: PomodoroState = {
      ...runningState,
      timerSession: {
        ...runningState.timerSession,
        accumulatedActiveSeconds: Math.min(
          runningState.timerSession.timerDurationSeconds,
          runningState.timerSession.accumulatedActiveSeconds + passedSeconds,
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

  // ----- Reset Tests -----
  it("resets the running timer and tracks the accumulated seconds", () => {
    const runningState: PomodoroState = {
      trackedValues: {
        ...POMODORO_INITIAL_STATE.trackedValues,
        focusSeconds: 300,
        breakSeconds: 100,
      },
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

  it("resets the paused timer and adds the accumulated seconds", () => {
    const testAccumulatedSeconds = 200;

    const pausedState: PomodoroState = {
      trackedValues: {
        ...POMODORO_INITIAL_STATE.trackedValues,
        focusSeconds: 300,
        breakSeconds: 100,
      },
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        phase: "focus",
        status: "paused",
        startedAtSeconds: null,
        endsAtSeconds: null,
        accumulatedActiveSeconds: testAccumulatedSeconds,
        sessionActive: true,
      },
    };

    const newState = reducer(pausedState, {
      type: ACTION_LABELS.resetTimer,
      nowSeconds: nowSeconds,
    });

    const expectedResult: PomodoroState = {
      trackedValues: {
        ...pausedState.trackedValues,
        focusSeconds:
          pausedState.trackedValues.focusSeconds +
          Math.min(
            pausedState.timerSession.timerDurationSeconds,
            testAccumulatedSeconds,
          ),
      },
      timerSession: {
        ...pausedState.timerSession,
        accumulatedActiveSeconds: 0,
        status: "ready",
        startedAtSeconds: null,
        endsAtSeconds: null,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("resets the break timer and adds stored seconds to tracked break seconds", () => {
    const runningState: PomodoroState = {
      trackedValues: {
        ...POMODORO_INITIAL_STATE.trackedValues,
        focusSeconds: 300,
        breakSeconds: 100,
      },
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        timerDurationSeconds: shortBreakPhaseDuration,
        phase: "shortBreak",
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds: nowSeconds + shortBreakPhaseDuration,
        accumulatedActiveSeconds: 0,
        sessionActive: true,
      },
    };

    const newState = reducer(runningState, {
      type: ACTION_LABELS.resetTimer,
      nowSeconds: newNowSeconds,
    });

    const expectedResult: PomodoroState = {
      trackedValues: {
        ...runningState.trackedValues,
        breakSeconds:
          runningState.trackedValues.breakSeconds +
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

  // ----- Phase Completion Tests -----
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

  // ----- Extend Break Tests -----
  it("extends a running break by adding duration, reconciling elapsed and updating endsAt timestamp", () => {
    const runningBreakState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        currentRoundNumber: 1,
        phase: "shortBreak",
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds: nowSeconds + shortBreakPhaseDuration,
        accumulatedActiveSeconds: 0,
        sessionActive: true,
      },
    };

    const newState = reducer(runningBreakState, {
      type: ACTION_LABELS.extendBreak,
      nowSeconds: newNowSeconds,
    });

    const newDuration =
      runningBreakState.timerSession.timerDurationSeconds +
      breakExtensionDuration;

    const expectedResult: PomodoroState = {
      ...runningBreakState,
      timerSession: {
        ...runningBreakState.timerSession,
        startedAtSeconds: newNowSeconds,
        accumulatedActiveSeconds: passedSeconds,
        breakExtended: true,
        timerDurationSeconds: newDuration,
        endsAtSeconds: newNowSeconds + newDuration - passedSeconds,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("extends a paused break by adding duration and does not create a new timestamp", () => {
    const pausedBreakState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        currentRoundNumber: 1,
        phase: "shortBreak",
        status: "paused",
        startedAtSeconds: null,
        endsAtSeconds: null,
        accumulatedActiveSeconds: 5,
        sessionActive: true,
      },
    };

    const newState = reducer(pausedBreakState, {
      type: ACTION_LABELS.extendBreak,
      nowSeconds: newNowSeconds,
    });

    const expectedResult: PomodoroState = {
      ...pausedBreakState,
      timerSession: {
        ...pausedBreakState.timerSession,
        timerDurationSeconds:
          pausedBreakState.timerSession.timerDurationSeconds +
          breakExtensionDuration,
        breakExtended: true,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("returns the same state on additional break extensions", () => {
    const pausedBreakState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        timerDurationSeconds: shortBreakPhaseDuration + breakExtensionDuration,
        currentRoundNumber: 1,
        phase: "shortBreak",
        status: "paused",
        startedAtSeconds: null,
        endsAtSeconds: null,
        accumulatedActiveSeconds: 5,
        sessionActive: true,
        breakExtended: true,
      },
    };

    const newState = reducer(pausedBreakState, {
      type: ACTION_LABELS.extendBreak,
      nowSeconds: newNowSeconds,
    });

    expect(newState).toBe(pausedBreakState);
  });

  // ----- End Break/End Session Tests -----
  it("ends a running break, tracks elapsed time and marks it completed", () => {
    const runningBreakState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        currentRoundNumber: 1,
        phase: "shortBreak",
        status: "running",
        startedAtSeconds: nowSeconds,
        endsAtSeconds: nowSeconds + shortBreakPhaseDuration,
        accumulatedActiveSeconds: 0,
        sessionActive: true,
      },
    };

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
          passedSeconds,
        ),
        status: "completed",
        startedAtSeconds: null,
        endsAtSeconds: null,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("ends a paused break, adds accumulated time and marks it completed", () => {
    const testAccumulatedSeconds = 200;

    const runningBreakState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        currentRoundNumber: 1,
        phase: "shortBreak",
        status: "paused",
        startedAtSeconds: null,
        endsAtSeconds: null,
        accumulatedActiveSeconds: testAccumulatedSeconds,
        sessionActive: true,
      },
    };

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
            testAccumulatedSeconds,
          ),
      },
      timerSession: {
        ...runningBreakState.timerSession,
        accumulatedActiveSeconds: Math.min(
          runningBreakState.timerSession.timerDurationSeconds,
          testAccumulatedSeconds,
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

  it("does not add break time twice on ending the session after a completed break", () => {
    const completedSessionState: PomodoroState = {
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        currentRoundNumber: 2,
        phase: "shortBreak",
        timerDurationSeconds: shortBreakPhaseDuration,
        sessionActive: true,
        status: "completed",
        accumulatedActiveSeconds: shortBreakPhaseDuration,
        breakExtended: false,
        startedAtSeconds: null,
        endsAtSeconds: null,
      },
      trackedValues: {
        completedRounds: 1,
        focusSeconds: focusPhaseDuration,
        breakSeconds: shortBreakPhaseDuration,
      },
    };

    const newState = reducer(completedSessionState, {
      type: ACTION_LABELS.endSession,
      nowSeconds,
    });

    const expectedResult: PomodoroState = {
      ...completedSessionState,
      timerSession: DEFAULT_TIMER_SESSION,
    };

    expect(newState).toEqual(expectedResult);
  });

  // ----- Other Tests -----
  it("starts the timer with running focus and valid ending timestamp on new session round", () => {
    const completedSessionState: PomodoroState = {
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        currentRoundNumber: 2,
        phase: "shortBreak",
        timerDurationSeconds: shortBreakPhaseDuration,
        sessionActive: true,
        status: "completed",
        accumulatedActiveSeconds: shortBreakPhaseDuration,
        breakExtended: false,
        startedAtSeconds: null,
        endsAtSeconds: null,
      },
      trackedValues: {
        completedRounds: 1,
        focusSeconds: focusPhaseDuration,
        breakSeconds: shortBreakPhaseDuration,
      },
    };

    const newState = reducer(completedSessionState, {
      type: ACTION_LABELS.newSessionRound,
      nowSeconds,
    });

    const expectedResult: PomodoroState = {
      ...completedSessionState,
      timerSession: {
        ...completedSessionState.timerSession,
        phase: "focus",
        status: "running",
        timerDurationSeconds: focusPhaseDuration,
        accumulatedActiveSeconds: 0,
        breakExtended: false,
        sessionActive: true,
        startedAtSeconds: nowSeconds,
        endsAtSeconds: nowSeconds + focusPhaseDuration,
      },
    };

    expect(newState).toEqual(expectedResult);
  });

  it("does not accumulate the seconds that exceed the timer phase duration", () => {
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

    const newNowSeconds = nowSeconds + 10000000;

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
            newNowSeconds - nowSeconds,
            runningState.timerSession.timerDurationSeconds,
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
