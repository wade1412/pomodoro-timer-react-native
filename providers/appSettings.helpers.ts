import {
  MAX_DAILY_GOAL_SECONDS,
  MIN_DAILY_GOAL_SECONDS,
} from "@/constants/goal.constants";
import {
  FOCUS_STEP_SECONDS,
  LONG_BREAK_STEP_SECONDS,
  MAX_FOCUS_SECONDS,
  MAX_LONG_BREAK_SECONDS,
  MAX_SHORT_BREAK_SECONDS,
  MIN_FOCUS_SECONDS,
  MIN_LONG_BREAK_SECONDS,
  MIN_SHORT_BREAK_SECONDS,
  SHORT_BREAK_STEP_SECONDS,
} from "@/constants/settings.constants";
import { AppSettings, DEFAULT_APP_SETTINGS } from "./appSettings.types";

export const migrateAppSettings = (value: unknown): AppSettings | null => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const migratedSettings = {
    ...DEFAULT_APP_SETTINGS,
    ...value,
  };

  return validateAppSettings(migratedSettings) ? migratedSettings : null;
};

export const validateAppSettings = (value: unknown): value is AppSettings => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const settings = value as Record<string, unknown>;

  // Validate Daily Goal Seconds
  if (typeof settings.dailyGoalSeconds !== "number") {
    return false;
  }
  if (!validateDailyGoalSeconds(settings.dailyGoalSeconds)) return false;

  // Validate focus duration
  if (typeof settings.focusDurationSeconds !== "number") {
    return false;
  }
  if (!validateFocusDurationSeconds(settings.focusDurationSeconds))
    return false;

  // Validate short break duration
  if (typeof settings.shortBreakDurationSeconds !== "number") {
    return false;
  }
  if (!validateShortBreakDurationSeconds(settings.shortBreakDurationSeconds))
    return false;

  // Validate long break duration
  if (typeof settings.longBreakDurationSeconds !== "number") {
    return false;
  }
  if (!validateLongBreakDurationSeconds(settings.longBreakDurationSeconds))
    return false;

  return true;
};

const validateSecondsSetting = (
  seconds: number,
  minimumValue: number,
  maximumValue: number,
  stepSeconds = -1,
) => {
  if (!Number.isFinite(seconds)) return false;
  if (!Number.isInteger(seconds)) return false;
  if (seconds < minimumValue || seconds > maximumValue) return false;

  if (stepSeconds > 0 && (seconds - minimumValue) % stepSeconds !== 0)
    return false;

  return true;
};

export const validateDailyGoalSeconds = (dailyGoalSeconds: number) =>
  validateSecondsSetting(
    dailyGoalSeconds,
    MIN_DAILY_GOAL_SECONDS,
    MAX_DAILY_GOAL_SECONDS,
  );

export const validateFocusDurationSeconds = (focusSeconds: number) =>
  validateSecondsSetting(
    focusSeconds,
    MIN_FOCUS_SECONDS,
    MAX_FOCUS_SECONDS,
    FOCUS_STEP_SECONDS,
  );

export const validateShortBreakDurationSeconds = (shortBreakSeconds: number) =>
  validateSecondsSetting(
    shortBreakSeconds,
    MIN_SHORT_BREAK_SECONDS,
    MAX_SHORT_BREAK_SECONDS,
    SHORT_BREAK_STEP_SECONDS,
  );

export const validateLongBreakDurationSeconds = (longBreakSeconds: number) =>
  validateSecondsSetting(
    longBreakSeconds,
    MIN_LONG_BREAK_SECONDS,
    MAX_LONG_BREAK_SECONDS,
    LONG_BREAK_STEP_SECONDS,
  );
