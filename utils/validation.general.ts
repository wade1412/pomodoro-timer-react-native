export const isNonNegativeSafeInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

export const isNullableTimestamp = (value: unknown): value is number | null =>
  value === null || isNonNegativeSafeInteger(value);
