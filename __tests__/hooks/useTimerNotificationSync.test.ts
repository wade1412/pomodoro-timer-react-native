import { POMODORO_INITIAL_STATE, TimerSession } from "@/constants/types";
import { useTimerNotificationSync } from "@/hooks/useTimerNotificationSync";
import {
  cancelTimerCompletionNotification,
  scheduleTimerCompletionNotification,
} from "@/services/timerNotifications";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react-native";

jest.mock("@/services/timerNotifications");

const mockSchedule = jest.mocked(scheduleTimerCompletionNotification);
const mockCancel = jest.mocked(cancelTimerCompletionNotification);

const createDeferred = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

const runningSession: TimerSession = {
  ...POMODORO_INITIAL_STATE.timerSession,
  status: "running",
  phase: "focus",
  sessionActive: true,
  startedAtSeconds: 1_000,
  endsAtSeconds: 2_500,
};

const pausedSession: TimerSession = {
  ...POMODORO_INITIAL_STATE.timerSession,
  status: "paused",
  phase: "focus",
  sessionActive: false,
  startedAtSeconds: null,
  endsAtSeconds: null,
};

describe("useTimerNotificationSync hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(1_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("schedules the notification when timer is running with valid endsAtSeconds", async () => {
    renderHook(() => useTimerNotificationSync(runningSession));

    // Test function execution and arguments
    await waitFor(() => {
      expect(scheduleTimerCompletionNotification).toHaveBeenCalledTimes(1);
      expect(scheduleTimerCompletionNotification).toHaveBeenCalledWith(
        runningSession.endsAtSeconds,
        runningSession.phase,
      );
    });
  });

  it("cancels the notification on timer pause", async () => {
    renderHook(() => useTimerNotificationSync(pausedSession));

    await waitFor(() => {
      expect(cancelTimerCompletionNotification).toHaveBeenCalledTimes(1);
    });
  });

  it("cancels the notification on timer phase completion", async () => {
    const completedTimerSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
      status: "completed",
      startedAtSeconds: null,
      sessionActive: false,
      endsAtSeconds: null,
    };

    renderHook(() => useTimerNotificationSync(completedTimerSession));

    await waitFor(() => {
      expect(cancelTimerCompletionNotification).toHaveBeenCalledTimes(1);
    });
  });

  it("cancels the notification on timer status ready", async () => {
    const readyTimerSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
    };

    renderHook(() => useTimerNotificationSync(readyTimerSession));

    await waitFor(() => {
      expect(cancelTimerCompletionNotification).toHaveBeenCalledTimes(1);
    });
  });

  // TODO Accumulated seconds does not trigger notification schedule
  it("does not schedule notification on accumulated seconds change", async () => {
    const initialSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
      status: "running",
      startedAtSeconds: 1_000_000,
      sessionActive: true,
      endsAtSeconds: 1_001_500,
      accumulatedActiveSeconds: 0,
    };

    const { rerender } = renderHook(
      (session: TimerSession) => useTimerNotificationSync(session),
      { initialProps: initialSession },
    );

    await waitFor(() => {
      expect(scheduleTimerCompletionNotification).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await Promise.resolve();
    });

    rerender({
      ...initialSession,
      accumulatedActiveSeconds: 15,
    });

    await waitFor(() => {
      expect(scheduleTimerCompletionNotification).toHaveBeenCalledTimes(1);
    });
  });

  it("handles scheduleTimerCompletionNotification rejection without creating unhandled promises", async () => {
    // Error sim
    const mockError = new Error("Native notification error");
    (
      scheduleTimerCompletionNotification as jest.MockedFunction<
        typeof scheduleTimerCompletionNotification
      >
    ).mockRejectedValueOnce(mockError);

    // Console spy to intercept console error and test catch
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const testTimerSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
      status: "running",
      startedAtSeconds: 1_000_000,
      sessionActive: true,
      endsAtSeconds: 1_001_500,
    };

    renderHook(() => useTimerNotificationSync(testTimerSession));

    // waiting for async code from useEffect
    await waitFor(() => {
      expect(scheduleTimerCompletionNotification).toHaveBeenCalledWith(
        testTimerSession.endsAtSeconds,
        testTimerSession.phase,
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Timer notification sync failed: ",
        mockError,
      );
    });

    consoleSpy.mockRestore();
  });

  it("waits for pending schedule before canceling notification", async () => {
    const pendingSchedule = createDeferred<boolean>();

    mockSchedule.mockReturnValueOnce(pendingSchedule.promise);
    mockCancel.mockResolvedValueOnce();

    const runningSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
      status: "running",
      phase: "focus",
      sessionActive: true,
      startedAtSeconds: 1_000,
      endsAtSeconds: 2_500,
    };

    const pausedSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
      status: "paused",
      phase: "focus",
      sessionActive: false,
      startedAtSeconds: null,
      endsAtSeconds: null,
    };

    const { rerender } = renderHook(
      (session: TimerSession) => useTimerNotificationSync(session),
      {
        initialProps: runningSession,
      },
    );

    await waitFor(() => expect(mockSchedule).toHaveBeenCalledTimes(1));

    rerender(pausedSession);

    // Wait for effect and microtaskst to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Cancel should not be called untill the scheduling is done
    expect(mockCancel).not.toHaveBeenCalled();

    await act(async () => {
      pendingSchedule.resolve(true);
      await pendingSchedule.promise;
    });

    await waitFor(() => expect(mockCancel).toHaveBeenCalledTimes(1));
  });

  it("continues synchronization after a scheduling failure", async () => {
    const mockError = new Error("Native scheduling failed");

    mockSchedule.mockRejectedValueOnce(mockError);
    mockCancel.mockResolvedValueOnce();

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { rerender } = renderHook(
      (session: TimerSession) => useTimerNotificationSync(session),
      {
        initialProps: runningSession,
      },
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Timer notification sync failed: ",
        mockError,
      );
    });

    rerender(pausedSession);

    await waitFor(() => {
      expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    consoleSpy.mockRestore();
  });
});
