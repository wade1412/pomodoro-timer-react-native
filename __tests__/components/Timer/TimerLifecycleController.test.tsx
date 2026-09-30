import TimerLifecycleController from "@/components/TimerLifecycleController";
import { POMODORO_INITIAL_STATE } from "@/constants/types";
import { useNowSeconds } from "@/hooks/useNowSeconds";
import {
  AppSettingsContextValue,
  DEFAULT_APP_SETTINGS,
} from "@/providers/appSettings.types";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { usePomodoroContext } from "@/providers/PomodoroProvider";
import { ACTION_LABELS } from "@/state/reducer.helpers";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react-native";

jest.mock("@/providers/AppSettingsProvider");
jest.mock("@/hooks/useNowSeconds");
jest.mock("@/providers/PomodoroProvider");

const mockUsePomodoroContext = jest.mocked(usePomodoroContext);
const mockUseAppSettings = jest.mocked(useAppSettings);
const mockUseNowSeconds = jest.mocked(useNowSeconds);

describe("TimerLifecycleController", () => {
  const mockDispatch = jest.fn();

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
    mockUseNowSeconds.mockReturnValue({
      nowSeconds: 1000,
      refreshNow: () => 1000,
    });
    mockUsePomodoroContext.mockReturnValue({
      state: {
        ...POMODORO_INITIAL_STATE,
        timerSession: { ...POMODORO_INITIAL_STATE.timerSession },
      },
      dispatch: mockDispatch,
    });
  });

  it("does not dispatch on timer that isnt running", () => {
    mockUsePomodoroContext.mockReturnValue({
      state: {
        ...POMODORO_INITIAL_STATE,
        timerSession: {
          ...POMODORO_INITIAL_STATE.timerSession,
          status: "ready",
          sessionActive: false,
        },
      },
      dispatch: mockDispatch,
    });

    render(<TimerLifecycleController />);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("does not dispatch on timer that hasnt ended", () => {
    mockUseAppSettings.mockReturnValue({
      ...defaultSettings,
      focusDurationSeconds: 1500,
    });

    mockUsePomodoroContext.mockReturnValue({
      state: {
        ...POMODORO_INITIAL_STATE,
        timerSession: {
          ...POMODORO_INITIAL_STATE.timerSession,
          status: "running",
          phase: "focus",
          startedAtSeconds: 0,
          endsAtSeconds: 1500,
          sessionActive: true,
        },
      },
      dispatch: mockDispatch,
    });

    mockUseNowSeconds.mockReturnValue({
      nowSeconds: 1000,
      refreshNow: () => 1000,
    });

    render(<TimerLifecycleController />);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  describe("When timer reaches completion", () => {
    it("dispatches completeFocus on focus phase", () => {
      mockUseAppSettings.mockReturnValue({
        ...defaultSettings,
        focusDurationSeconds: 1500,
      });

      mockUsePomodoroContext.mockReturnValue({
        state: {
          ...POMODORO_INITIAL_STATE,
          timerSession: {
            ...POMODORO_INITIAL_STATE.timerSession,
            status: "running",
            phase: "focus",

            startedAtSeconds: 0,
            endsAtSeconds: 1500,
            sessionActive: true,
          },
        },
        dispatch: mockDispatch,
      });

      const nowSeconds = 1600;

      mockUseNowSeconds.mockReturnValue({
        nowSeconds,
        refreshNow: () => nowSeconds,
      });

      render(<TimerLifecycleController />);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: ACTION_LABELS.completeFocus,
        nowSeconds,
        shortBreakDurationSeconds: defaultSettings.shortBreakDurationSeconds,
        longBreakDurationSeconds: defaultSettings.longBreakDurationSeconds,
      });
    });

    it("dispatches endBreak on shortBreak phase", () => {
      mockUseAppSettings.mockReturnValue({
        ...defaultSettings,
        shortBreakDurationSeconds: 300,
      });

      mockUsePomodoroContext.mockReturnValue({
        state: {
          ...POMODORO_INITIAL_STATE,
          timerSession: {
            ...POMODORO_INITIAL_STATE.timerSession,
            status: "running",
            phase: "shortBreak",

            startedAtSeconds: 0,
            endsAtSeconds: 300,
            sessionActive: true,
          },
        },
        dispatch: mockDispatch,
      });

      const nowSeconds = 310;

      mockUseNowSeconds.mockReturnValue({
        nowSeconds,
        refreshNow: () => nowSeconds,
      });

      render(<TimerLifecycleController />);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: ACTION_LABELS.endBreak,
        nowSeconds,
      });
    });

    it("dispatches endBreak on longBreak phase", () => {
      mockUseAppSettings.mockReturnValue({
        ...defaultSettings,
        longBreakDurationSeconds: 600,
      });

      mockUsePomodoroContext.mockReturnValue({
        state: {
          ...POMODORO_INITIAL_STATE,
          timerSession: {
            ...POMODORO_INITIAL_STATE.timerSession,
            status: "running",
            phase: "longBreak",

            startedAtSeconds: 0,
            endsAtSeconds: 600,
            sessionActive: true,
          },
        },
        dispatch: mockDispatch,
      });

      const nowSeconds = 610;

      mockUseNowSeconds.mockReturnValue({
        nowSeconds,
        refreshNow: () => nowSeconds,
      });

      render(<TimerLifecycleController />);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: ACTION_LABELS.endBreak,
        nowSeconds,
      });
    });
  });
});
