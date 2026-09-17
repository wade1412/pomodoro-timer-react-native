import {
  createMonthGrid,
  getDateInfo,
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
});
