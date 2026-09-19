import { validateTrackingHistory } from "@/state/tracking.validation";
import { describe, expect, it } from "@jest/globals";

const validDay = {
  dateKey: "2026-09-19",
  completedRounds: 2,
  focusSeconds: 3_000,
  breakSeconds: 600,
  updatedAtSeconds: 1_790_111_200,
};

describe("tracking history validation", () => {
  it("accepts a valid tracking history", () => {
    expect(
      validateTrackingHistory({
        [validDay.dateKey]: validDay,
      }),
    ).toBe(true);
  });

  it("rejects an invalid date key", () => {
    expect(
      validateTrackingHistory({
        "2026-02-30": {
          ...validDay,
          dateKey: "2026-02-30",
        },
      }),
    ).toBe(false);
  });

  it("rejects negative tracked seconds", () => {
    expect(
      validateTrackingHistory({
        [validDay.dateKey]: {
          ...validDay,
          focusSeconds: -1,
        },
      }),
    ).toBe(false);
  });

  it("rejects a string instead of a number", () => {
    expect(
      validateTrackingHistory({
        [validDay.dateKey]: {
          ...validDay,
          focusSeconds: "3000",
        },
      }),
    ).toBe(false);
  });

  it("accepts an empty tracking history", () => {
    expect(validateTrackingHistory({})).toBe(true);
  });
});
