import {
  createMonthGrid,
  getDateInfo,
  getGoalProgressLevel,
  getLocalDateFromDateKey,
} from "@/components/Calendar/calendar.helpers";
import { describe, expect, it } from "@jest/globals";

describe("calendar helpers", () => {
  it("returns deterministic information for September 2026", () => {
    expect(getDateInfo(new Date(2026, 8, 15, 12))).toEqual({
      year: 2026,
      month: 8,
      label: "September 2026",
    });
  });

  it("places September 1, 2026 in the Tuesday column", () => {
    const grid = createMonthGrid(2026, 8);

    expect(grid.row1).toEqual([" ", " ", "1", "2", "3", "4", "5"]);
    expect(grid.row5[3]).toBe("30");
  });

  it("creates a local calendar date from a date key", () => {
    const date = getLocalDateFromDateKey("2026-09-20");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(20);
  });

  it("keeps progress just below the goal in the highest incomplete band", () => {
    expect(getGoalProgressLevel(5_999, 6_000)).toBe("from50To99");
    expect(getGoalProgressLevel(6_000, 6_000)).toBe("reached");
  });
});
