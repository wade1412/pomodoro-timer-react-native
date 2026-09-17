import {
  DailyTracking,
  DateKey,
  TrackingDelta,
  TrackingHistory,
} from "@/constants/types";

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getLocalDateKey = (timestampSeconds: number): DateKey => {
  const date = new Date(timestampSeconds * 1000);

  return getDateKey(date);
};

export const getDateKeyFromDay = (year: number, month: number, day: number) => {
  const date = new Date(year, month, day);

  return getDateKey(date);
};

export const createEmptyDailyTracking = (dateKey: DateKey): DailyTracking => ({
  dateKey,
  completedRounds: 0,
  focusSeconds: 0,
  breakSeconds: 0,
  updatedAtSeconds: 0,
});

export const updateTrackingHistory = (
  history: TrackingHistory,
  dateKey: DateKey,
  delta: TrackingDelta,
  nowSeconds: number,
): TrackingHistory => {
  const currentDay = history[dateKey] ?? createEmptyDailyTracking(dateKey);

  return {
    ...history,
    [dateKey]: {
      ...currentDay,
      completedRounds: currentDay.completedRounds + delta.completedRounds,
      focusSeconds: currentDay.focusSeconds + delta.focusSeconds,
      breakSeconds: currentDay.breakSeconds + delta.breakSeconds,
      updatedAtSeconds: nowSeconds,
    },
  };
};
