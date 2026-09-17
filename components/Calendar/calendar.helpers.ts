import { TrackingHistory } from "@/constants/types";
import { getDateKeyFromDay } from "@/state/tracking.helpers";
import { DateInfo, MonthlyTracking } from "./calendar.types";

export const weekdaysUINames = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const ROWS_NUMBER = 6;
const COLUMNS_NUMBER = 7;

const generateArrayGrid = () => {
  const grid: Record<string, string[]> = {};

  for (let i = 1; i <= ROWS_NUMBER; i++) {
    const rowKey = `row${i}`;

    if (!grid[rowKey]) {
      grid[rowKey] = [];
    }

    let j = 0;
    while (j < COLUMNS_NUMBER) {
      grid[rowKey].push(" ");
      j++;
    }
  }

  return grid;
};

export const createMonthGrid = (year: number, month: number) => {
  const calendarGrid = generateArrayGrid();
  const gridKeys = Object.keys(calendarGrid);

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let currentRow = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeekNumber = new Date(year, month, day).getDay();
    const currentRowKey = gridKeys[currentRow];

    calendarGrid[currentRowKey][dayOfWeekNumber] = String(day);

    if (dayOfWeekNumber === 6 && currentRow < ROWS_NUMBER - 1) {
      currentRow++;
    }
  }

  return calendarGrid;
};

export const getDateInfo = (date: Date): DateInfo => {
  const month = date.getMonth();
  const currentMonthName = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  return {
    year,
    month,
    label: `${currentMonthName} ${year}`,
  };
};

export const getMonthlyTracking = (
  trackingHistory: TrackingHistory,
  year: number,
  month: number,
): MonthlyTracking => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthlyTracking = {
    monthFocusSeconds: 0,
    monthRoundsCompleted: 0,
    monthActiveDays: 0,
  };

  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = getDateKeyFromDay(year, month, i);

    if (!trackingHistory[dateKey]) continue;

    const { focusSeconds, completedRounds, breakSeconds } =
      trackingHistory[dateKey];

    monthlyTracking.monthFocusSeconds =
      monthlyTracking.monthFocusSeconds + focusSeconds;
    monthlyTracking.monthRoundsCompleted =
      monthlyTracking.monthRoundsCompleted + completedRounds;
    if (focusSeconds > 0 || breakSeconds > 0) {
      monthlyTracking.monthActiveDays++;
    }
  }

  return monthlyTracking;
};
