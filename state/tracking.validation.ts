import {
  DailyTracking,
  DateKey,
  TrackingDelta,
  TrackingHistory,
} from "@/constants/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

export const validateDateKeyFormat = (key: unknown): key is DateKey => {
  if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return false;
  }

  const [year, month, day] = key.split("-").map(Number);
  const candidate = new Date(0);
  candidate.setUTCHours(0, 0, 0, 0);
  candidate.setUTCFullYear(year, month - 1, day);

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
};

export const validateTrackingDelta = (
  value: unknown,
): value is TrackingDelta => {
  if (!isRecord(value)) return false;

  return (
    isNonNegativeInteger(value.completedRounds) &&
    isNonNegativeInteger(value.focusSeconds) &&
    isNonNegativeInteger(value.breakSeconds)
  );
};

export const validateDailyTracking = (
  value: unknown,
  historyDateKey: DateKey,
): value is DailyTracking => {
  if (!isRecord(value)) return false;

  return (
    value.dateKey === historyDateKey &&
    validateDateKeyFormat(value.dateKey) &&
    isNonNegativeInteger(value.completedRounds) &&
    isNonNegativeInteger(value.focusSeconds) &&
    isNonNegativeInteger(value.breakSeconds) &&
    isNonNegativeInteger(value.updatedAtSeconds)
  );
};

export const validateTrackingHistory = (
  value: unknown,
): value is TrackingHistory => {
  if (!isRecord(value)) return false;

  return Object.entries(value).every(
    ([dateKey, dailyTracking]) =>
      validateDateKeyFormat(dateKey) &&
      validateDailyTracking(dailyTracking, dateKey),
  );
};
