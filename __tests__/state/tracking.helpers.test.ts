import { TrackingHistory } from "@/constants/types";
import {
  getLocalDateKey,
  updateTrackingHistory,
} from "@/state/tracking.helpers";
import { describe, expect, it } from "@jest/globals";

describe("tracking helpers", () => {
  it("creates a date key from local calendar values", () => {
    const localDate = new Date(2026, 8, 16, 12, 30, 0);
    const timestampSeconds = Math.floor(localDate.getTime() / 1000);

    expect(getLocalDateKey(timestampSeconds)).toBe("2026-09-16");
  });

  it("keeps adjacent local days under different keys", () => {
    const beforeMidnight = Math.floor(
      new Date(2026, 8, 16, 23, 59, 59).getTime() / 1000,
    );
    const afterMidnight = Math.floor(
      new Date(2026, 8, 17, 0, 0, 1).getTime() / 1000,
    );

    expect(getLocalDateKey(beforeMidnight)).toBe("2026-09-16");
    expect(getLocalDateKey(afterMidnight)).toBe("2026-09-17");
  });

  it("creates a missing day and applies a delta", () => {
    const history = updateTrackingHistory(
      {},
      "2026-09-16",
      { completedRounds: 1, focusSeconds: 300, breakSeconds: 0 },
      1_000,
    );

    expect(history).toEqual({
      "2026-09-16": {
        dateKey: "2026-09-16",
        completedRounds: 1,
        focusSeconds: 300,
        breakSeconds: 0,
        updatedAtSeconds: 1_000,
      },
    });
  });

  it("adds a delta to an existing day without mutating the input", () => {
    const currentHistory: TrackingHistory = {
      "2026-09-16": {
        dateKey: "2026-09-16",
        completedRounds: 2,
        focusSeconds: 1_200,
        breakSeconds: 300,
        updatedAtSeconds: 1_000,
      },
    };
    const nextHistory = updateTrackingHistory(
      currentHistory,
      "2026-09-16",
      { completedRounds: 1, focusSeconds: 600, breakSeconds: 120 },
      2_000,
    );

    expect(nextHistory["2026-09-16"]).toEqual({
      dateKey: "2026-09-16",
      completedRounds: 3,
      focusSeconds: 1_800,
      breakSeconds: 420,
      updatedAtSeconds: 2_000,
    });
    expect(currentHistory["2026-09-16"].focusSeconds).toBe(1_200);
    expect(nextHistory).not.toBe(currentHistory);
  });

  it("preserves other dates when updating one day", () => {
    const currentHistory: TrackingHistory = {
      "2026-09-15": {
        dateKey: "2026-09-15",
        completedRounds: 1,
        focusSeconds: 1_500,
        breakSeconds: 300,
        updatedAtSeconds: 900,
      },
    };
    const nextHistory = updateTrackingHistory(
      currentHistory,
      "2026-09-16",
      { completedRounds: 0, focusSeconds: 300, breakSeconds: 0 },
      1_000,
    );

    expect(nextHistory["2026-09-15"]).toBe(
      currentHistory["2026-09-15"],
    );
    expect(nextHistory["2026-09-16"].focusSeconds).toBe(300);
  });

  it("returns the original history for an invalid delta", () => {
    const currentHistory: TrackingHistory = {};

    const nextHistory = updateTrackingHistory(
      currentHistory,
      "2026-09-16",
      { completedRounds: 0, focusSeconds: -1, breakSeconds: 0 },
      1_000,
    );

    expect(nextHistory).toBe(currentHistory);
  });
});
