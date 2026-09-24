import { SETTINGS_DURATIONS } from "@/constants/settings.constants";
import {
  migrateAppSettings,
  validateFocusDurationSeconds,
  validateLongBreakDurationSeconds,
  validateShortBreakDurationSeconds,
} from "@/providers/appSettings.helpers";
import { DEFAULT_APP_SETTINGS } from "@/providers/appSettings.types";
import { describe, expect, it } from "@jest/globals";

describe("app settings helpers", () => {
  it("accepts values aligned to each configured duration step", () => {
    expect(validateFocusDurationSeconds(25 * 60)).toBe(true);
    expect(validateShortBreakDurationSeconds(5 * 60)).toBe(true);
    expect(validateLongBreakDurationSeconds(15 * 60)).toBe(true);
  });

  it("rejects values outside ranges or between steps", () => {
    expect(validateFocusDurationSeconds(9 * 60)).toBe(false);
    expect(validateFocusDurationSeconds(23 * 60)).toBe(false);
    expect(validateShortBreakDurationSeconds(2 * 60)).toBe(false);
    expect(validateLongBreakDurationSeconds(12 * 60)).toBe(false);
  });

  it("fills newly introduced settings when migrating legacy storage", () => {
    const migrated = migrateAppSettings({ dailyGoalSeconds: 120 * 60 });

    expect(migrated).toEqual({
      ...DEFAULT_APP_SETTINGS,
      dailyGoalSeconds: 120 * 60,
      focusDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
      shortBreakDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.shortBreakPhaseSeconds,
      longBreakDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.longBreakPhaseSeconds,
    });
  });

  it("rejects malformed persisted values", () => {
    expect(migrateAppSettings(null)).toBeNull();
    expect(migrateAppSettings([])).toBeNull();
    expect(migrateAppSettings({ dailyGoalSeconds: "invalid" })).toBeNull();
  });
});
