import { DEFAULT_DAILY_GOAL_SECONDS } from "@/constants/goal.constants";
import {
  DEFAULT_FOCUS_DURATION_SECONDS,
  DEFAULT_LONG_BREAK_DURATION_SECONDS,
  DEFAULT_SHORT_BREAK_DURATION_SECONDS,
} from "@/constants/settings.constants";

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
  dailyGoalSeconds: DEFAULT_DAILY_GOAL_SECONDS,
  focusDurationSeconds: DEFAULT_FOCUS_DURATION_SECONDS,
  shortBreakDurationSeconds: DEFAULT_SHORT_BREAK_DURATION_SECONDS,
  longBreakDurationSeconds: DEFAULT_LONG_BREAK_DURATION_SECONDS,
};
