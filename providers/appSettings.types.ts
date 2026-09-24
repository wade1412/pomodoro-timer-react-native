import { GOAL_DURATIONS } from "@/constants/goal.constants";
import { SETTINGS_DURATIONS } from "@/constants/settings.constants";

export type AppSettings = {
  dailyGoalSeconds: number;
  focusDurationSeconds: number;
  shortBreakDurationSeconds: number;
  longBreakDurationSeconds: number;
};

export type AppSettingsContextValue = {
  dailyGoalSeconds: number;
  focusDurationSeconds: number;
  shortBreakDurationSeconds: number;
  longBreakDurationSeconds: number;
  updateDailyGoalSeconds: (seconds: number) => boolean;
  updateFocusDurationSeconds: (seconds: number) => boolean;
  updateShortBreakDurationSeconds: (seconds: number) => boolean;
  updateLongBreakDurationSeconds: (seconds: number) => boolean;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  dailyGoalSeconds: GOAL_DURATIONS.defailtGoalSeconds,
  focusDurationSeconds: SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
  shortBreakDurationSeconds:
    SETTINGS_DURATIONS.defaultDurations.shortBreakPhaseSeconds,
  longBreakDurationSeconds:
    SETTINGS_DURATIONS.defaultDurations.longBreakPhaseSeconds,
};
