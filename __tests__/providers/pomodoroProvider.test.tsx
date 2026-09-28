import { SETTINGS_DURATIONS } from "@/constants/settings.constants";
import {
  POMODORO_STATE_STORAGE_KEY,
  POMODORO_TRACKING_STORAGE_KEY,
} from "@/constants/storage.constants";
import {
  POMODORO_INITIAL_STATE,
  PomodoroState,
  TrackingHistory,
} from "@/constants/types";
import { getNowSeconds } from "@/hooks/useNowSeconds";
import {
  AppSettingsContextValue,
  DEFAULT_APP_SETTINGS,
} from "@/providers/appSettings.types";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { getStorageByKey, storeData } from "@/providers/asyncStorage.helpers";
import {
  PomodoroProvider,
  usePomodoroContext,
} from "@/providers/PomodoroProvider";
import { createPersistedPomodoroState } from "@/state/pomodoro.persistence";
import { getLocalDateKey } from "@/state/tracking.helpers";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react-native";

jest.mock("@/providers/AppSettingsProvider");
jest.mock("@/providers/asyncStorage.helpers");
jest.mock("@/hooks/useNowSeconds");

const mockUseAppSettings = jest.mocked(useAppSettings);
const mockGetStorageByKey = jest.mocked(getStorageByKey);
const mockStoreData = jest.mocked(storeData);
const mockGetNowSeconds = jest.mocked(getNowSeconds);

describe("PomodoroProvider", () => {
  const defaultSettings: AppSettingsContextValue = {
    ...DEFAULT_APP_SETTINGS,
    updateDailyGoalSeconds: () => true,
    updateFocusDurationSeconds: () => true,
    updateShortBreakDurationSeconds: () => true,
    updateLongBreakDurationSeconds: () => true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAppSettings.mockReturnValue(defaultSettings);
    mockGetNowSeconds.mockReturnValue(1000);
    mockGetStorageByKey.mockResolvedValue(null);
  });

  const renderPomodoroHook = () =>
    renderHook(() => usePomodoroContext(), {
      wrapper: PomodoroProvider,
    });

  describe("Hydration and Persistence", () => {
    it("initializes with base state and hydrates from async storage", async () => {
      const persistedState: PomodoroState = {
        ...POMODORO_INITIAL_STATE,
        timerSession: {
          ...POMODORO_INITIAL_STATE.timerSession,
          status: "paused",
          accumulatedActiveSeconds: 300,
          startedAtSeconds: null,
          endsAtSeconds: null,
          breakExtended: false,
          sessionActive: true,
        },
      };

      mockGetStorageByKey.mockImplementation((key) =>
        Promise.resolve(
          key === POMODORO_STATE_STORAGE_KEY
            ? createPersistedPomodoroState(persistedState)
            : null,
        ),
      );

      const { result } = renderPomodoroHook();

      await waitFor(() => {
        expect(result.current.state.timerSession.status).toBe("paused");
        expect(result.current.state.timerSession.accumulatedActiveSeconds).toBe(
          300,
        );
        expect(result.current.state.trackingHistory).toEqual(
          POMODORO_INITIAL_STATE.trackingHistory,
        );
        expect(getStorageByKey).toBeCalledTimes(2);
        expect(getStorageByKey).toBeCalledWith(POMODORO_STATE_STORAGE_KEY);
        expect(getStorageByKey).toBeCalledWith(POMODORO_TRACKING_STORAGE_KEY);
      });
    });

    it("falls back to default state on invalid storage key", async () => {
      mockGetStorageByKey.mockResolvedValueOnce(null);

      const { result } = renderPomodoroHook();

      await waitFor(() => {
        expect(result.current.state.trackingHistory).toEqual(
          POMODORO_INITIAL_STATE.trackingHistory,
        );
        expect(result.current.state.timerSession.phase).toEqual("focus");
        expect(result.current.state.timerSession.timerDurationSeconds).toEqual(
          defaultSettings.focusDurationSeconds,
        );
        expect(getStorageByKey).toBeCalledTimes(2);
      });
    });

    it("persists the state after hydration", async () => {
      const persistedState: PomodoroState = {
        ...POMODORO_INITIAL_STATE,
        timerSession: {
          ...POMODORO_INITIAL_STATE.timerSession,
          status: "paused",
          accumulatedActiveSeconds: 300,
          startedAtSeconds: null,
          endsAtSeconds: null,
          breakExtended: false,
          sessionActive: true,
        },
      };

      mockGetStorageByKey.mockImplementation((key) =>
        Promise.resolve(
          key === POMODORO_STATE_STORAGE_KEY
            ? createPersistedPomodoroState(persistedState)
            : null,
        ),
      );

      const { result } = renderPomodoroHook();

      await waitFor(() => {
        expect(mockStoreData).toHaveBeenCalledTimes(1);
        expect(mockStoreData).toHaveBeenCalledWith(
          POMODORO_STATE_STORAGE_KEY,
          createPersistedPomodoroState(result.current.state),
        );
      });
    });

    it("hydrates valid legacy tracking when versioned state is unavailable", async () => {
      const legacyHistory: TrackingHistory = {
        "2026-09-19": {
          dateKey: "2026-09-19",
          completedRounds: 2,
          focusSeconds: 3_000,
          breakSeconds: 600,
          updatedAtSeconds: 1_790_111_200,
        },
      };

      mockGetStorageByKey.mockImplementation(async (key) => {
        if (key === POMODORO_STATE_STORAGE_KEY) return null;
        if (key === POMODORO_TRACKING_STORAGE_KEY) return legacyHistory;
        return null;
      });

      const { result } = renderPomodoroHook();

      await waitFor(() => {
        expect(result.current.state.trackingHistory).toEqual(legacyHistory);
        expect(result.current.state.timerSession).toEqual({
          ...POMODORO_INITIAL_STATE.timerSession,
          timerDurationSeconds: defaultSettings.focusDurationSeconds,
        });
      });
    });

    it("falls back to default state on invalid storage version", async () => {
      mockGetStorageByKey.mockImplementation(async (key) => {
        if (key === POMODORO_STATE_STORAGE_KEY) return { version: 999 };
      });

      const { result } = renderPomodoroHook();

      await waitFor(() => {
        expect(result.current.state).toEqual(POMODORO_INITIAL_STATE);
      });
    });

    it("reconciles a timer that is ready", async () => {
      const persistedState: PomodoroState = {
        ...POMODORO_INITIAL_STATE,
        timerSession: {
          ...POMODORO_INITIAL_STATE.timerSession,
          status: "ready",
          phase: "focus",
          timerDurationSeconds: defaultSettings.focusDurationSeconds,
          accumulatedActiveSeconds: 0,
          startedAtSeconds: null,
          endsAtSeconds: null,
          breakExtended: false,
          sessionActive: false,
        },
      };

      mockUseAppSettings.mockReturnValue(defaultSettings);

      mockGetStorageByKey.mockImplementation((key) =>
        Promise.resolve(
          key === POMODORO_STATE_STORAGE_KEY
            ? createPersistedPomodoroState(persistedState)
            : null,
        ),
      );

      const { result, rerender } = renderPomodoroHook();

      await waitFor(() => {
        expect(result.current.state.timerSession.timerDurationSeconds).toBe(
          defaultSettings.focusDurationSeconds,
        );
      });

      const newTimerDuration = 1800;
      mockUseAppSettings.mockReturnValue({
        ...defaultSettings,
        focusDurationSeconds: newTimerDuration,
      });

      rerender({});

      await waitFor(() => {
        expect(result.current.state.timerSession.timerDurationSeconds).toEqual(
          newTimerDuration,
        );
        expect(result.current.state.timerSession.endsAtSeconds).toBe(null);
      });
    });

    it("reconciles a running timer that hasnt ended after the duration change", async () => {
      const mockStartedAt = 900;
      const mockEndsAt = mockStartedAt + defaultSettings.focusDurationSeconds;

      const persistedState: PomodoroState = {
        ...POMODORO_INITIAL_STATE,
        timerSession: {
          ...POMODORO_INITIAL_STATE.timerSession,
          status: "running",
          phase: "focus",
          timerDurationSeconds: defaultSettings.focusDurationSeconds,
          accumulatedActiveSeconds: 0,
          startedAtSeconds: mockStartedAt,
          endsAtSeconds: mockEndsAt,
          breakExtended: false,
          sessionActive: true,
        },
      };

      mockUseAppSettings.mockReturnValue(defaultSettings);

      mockGetStorageByKey.mockImplementation((key) =>
        Promise.resolve(
          key === POMODORO_STATE_STORAGE_KEY
            ? createPersistedPomodoroState(persistedState)
            : null,
        ),
      );

      const { result, rerender } = renderPomodoroHook();

      await waitFor(() => {
        expect(result.current.state.timerSession.timerDurationSeconds).toEqual(
          defaultSettings.focusDurationSeconds,
        );
      });

      const newTimerDuration = 1800;
      const mockSecondsPassed = 100;
      const mockNowSeconds = mockStartedAt + mockSecondsPassed;
      const expectedNewEndsAtSeconds =
        mockNowSeconds + newTimerDuration - mockSecondsPassed;

      mockUseAppSettings.mockReturnValue({
        ...defaultSettings,
        focusDurationSeconds: newTimerDuration,
      });
      mockGetNowSeconds.mockImplementation(() => mockNowSeconds);

      rerender({});

      await waitFor(() => {
        expect(result.current.state.timerSession.timerDurationSeconds).toEqual(
          newTimerDuration,
        );
        expect(result.current.state.timerSession.endsAtSeconds).toBe(
          expectedNewEndsAtSeconds,
        );
      });
    });

    it("reconciles a running timer that has ended after the duration change completing the phase and tracks the seconds spent on phase", async () => {
      const mockStartedAt = 900;
      const persistedState: PomodoroState = {
        ...POMODORO_INITIAL_STATE,
        timerSession: {
          ...POMODORO_INITIAL_STATE.timerSession,
          status: "running",
          phase: "focus",
          timerDurationSeconds: 1500,
          accumulatedActiveSeconds: 0,
          startedAtSeconds: mockStartedAt,
          endsAtSeconds: 2400,
          breakExtended: false,
          sessionActive: true,
        },
      };

      mockUseAppSettings.mockReturnValue(defaultSettings);

      mockGetStorageByKey.mockImplementation((key) =>
        Promise.resolve(
          key === POMODORO_STATE_STORAGE_KEY
            ? createPersistedPomodoroState(persistedState)
            : null,
        ),
      );

      const { result, rerender } = renderPomodoroHook();

      await waitFor(() => {
        expect(result.current.state.timerSession.timerDurationSeconds).toEqual(
          defaultSettings.focusDurationSeconds,
        );
      });

      const newTimerDuration = 1000;
      const mockSecondsPassed = 1200;
      const mockNowSeconds = mockStartedAt + mockSecondsPassed;

      const dateKey = getLocalDateKey(mockNowSeconds);

      mockUseAppSettings.mockReturnValue({
        ...defaultSettings,
        focusDurationSeconds: newTimerDuration,
      });
      mockGetNowSeconds.mockImplementation(() => mockNowSeconds);

      rerender({});

      expect(result.current.state.trackingHistory[dateKey]).toMatchObject({
        completedRounds: 1,
        focusSeconds: mockSecondsPassed,
        breakSeconds: 0,
        updatedAtSeconds: mockNowSeconds,
      });

      await waitFor(() => {
        expect(result.current.state.timerSession.phase).toBe("shortBreak");
        expect(result.current.state.timerSession.status).toBe("ready");
        expect(result.current.state.timerSession.timerDurationSeconds).toBe(
          defaultSettings.shortBreakDurationSeconds,
        );
      });
    });

    it("reconciles a break timer and accounts the break extension", async () => {
      const mockStartedAt = 900;
      const mockExtendedBreakDuration =
        defaultSettings.shortBreakDurationSeconds +
        SETTINGS_DURATIONS.defaultDurations.breakExtensionSeconds;
      const mockEndsAt = mockStartedAt + mockExtendedBreakDuration;

      const persistedState: PomodoroState = {
        ...POMODORO_INITIAL_STATE,
        timerSession: {
          currentRoundNumber: 1,
          accumulatedActiveSeconds: 0,
          status: "running",
          phase: "shortBreak",
          timerDurationSeconds: mockExtendedBreakDuration,
          startedAtSeconds: mockStartedAt,
          endsAtSeconds: mockEndsAt,
          breakExtended: true,
          sessionActive: true,
        },
      };

      mockUseAppSettings.mockReturnValue(defaultSettings);

      mockGetStorageByKey.mockImplementation((key) =>
        Promise.resolve(
          key === POMODORO_STATE_STORAGE_KEY
            ? createPersistedPomodoroState(persistedState)
            : null,
        ),
      );

      const { result, rerender } = renderPomodoroHook();

      await waitFor(() => {
        expect(result.current.state.timerSession.timerDurationSeconds).toEqual(
          defaultSettings.shortBreakDurationSeconds +
            SETTINGS_DURATIONS.defaultDurations.breakExtensionSeconds,
        );
      });

      const newTimerDuration = 600;
      const mockSecondsPassed = 100;
      const mockNowSeconds = mockStartedAt + mockSecondsPassed;
      const expectedNewEndsAtSeconds =
        mockNowSeconds +
        newTimerDuration +
        SETTINGS_DURATIONS.defaultDurations.breakExtensionSeconds -
        mockSecondsPassed;

      mockUseAppSettings.mockReturnValue({
        ...defaultSettings,
        shortBreakDurationSeconds: newTimerDuration,
      });
      mockGetNowSeconds.mockImplementation(() => mockNowSeconds);

      rerender({});

      await waitFor(() => {
        expect(result.current.state.timerSession.endsAtSeconds).toEqual(
          expectedNewEndsAtSeconds,
        );
        expect(result.current.state.timerSession.breakExtended).toBe(true);
      });
    });
  });
});
