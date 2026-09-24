import { GOAL_DURATIONS } from "@/constants/goal.constants";
import { SETTINGS_DURATIONS } from "@/constants/settings.constants";
import { AppSettings, DEFAULT_APP_SETTINGS } from "./appSettings.types";

const { focusPhase, shortBreakPhase, longBreakPhase } = SETTINGS_DURATIONS;

// Check if seconds given by the setting is number, a positive number and is finite;
// Check if it falls into the valid range
// If there are steps - check if the seconds is one of the steps
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

// Validation for each duration setting
export const validateDailyGoalSeconds = (dailyGoalSeconds: number) =>
  validateSecondsSetting(
    dailyGoalSeconds,
    GOAL_DURATIONS.minSeconds,
    GOAL_DURATIONS.maxSeconds,
  );
export const validateFocusDurationSeconds = (focusSeconds: number) =>
  validateSecondsSetting(
    focusSeconds,
    focusPhase.minSeconds,
    focusPhase.maxSeconds,
    focusPhase.stepSeconds,
  );
export const validateShortBreakDurationSeconds = (shortBreakSeconds: number) =>
  validateSecondsSetting(
    shortBreakSeconds,
    shortBreakPhase.minSeconds,
    shortBreakPhase.maximumValue,
    shortBreakPhase.stepSeconds,
  );
export const validateLongBreakDurationSeconds = (longBreakSeconds: number) =>
  validateSecondsSetting(
    longBreakSeconds,
    longBreakPhase.minSeconds,
    longBreakPhase.maxSeconds,
    longBreakPhase.stepSeconds,
  );

// Migration helper to avoid conflicts on old settings verions
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

// Validate all App Settings - settings object and then every duration setting
export const validateAppSettings = (value: unknown): value is AppSettings => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const settings = value as Record<string, unknown>;

  if (typeof settings.dailyGoalSeconds !== "number") {
    return false;
  }
  if (!validateDailyGoalSeconds(settings.dailyGoalSeconds)) return false;

  if (typeof settings.focusDurationSeconds !== "number") {
    return false;
  }
  if (!validateFocusDurationSeconds(settings.focusDurationSeconds))
    return false;

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
