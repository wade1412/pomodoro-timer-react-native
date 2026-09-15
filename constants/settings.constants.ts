export const DEFAULT_FOCUS_DURATION_SECONDS = 25 * 60;

export const MIN_FOCUS_SECONDS = 10 * 60;
export const MAX_FOCUS_SECONDS = 40 * 60;
export const FOCUS_STEP_SECONDS = 5 * 60;

export const DEFAULT_SHORT_BREAK_DURATION_SECONDS = 5 * 60;
export const DEFAULT_LONG_BREAK_DURATION_SECONDS = 15 * 60;

export const MIN_SHORT_BREAK_SECONDS = 1 * 60;
export const MAX_SHORT_BREAK_SECONDS = 15 * 60;
export const SHORT_BREAK_STEP_SECONDS = 2 * 60;

export const MIN_LONG_BREAK_SECONDS = 5 * 60;
export const MAX_LONG_BREAK_SECONDS = 30 * 60;
export const LONG_BREAK_STEP_SECONDS = 5 * 60;

const createMinuteOptions = (
  minimum: number,
  maximum: number,
  step: number,
) => {
  const options: number[] = [];

  for (let value = minimum; value <= maximum; value += step) {
    options.push(value / 60);
  }

  return options;
};

export const FOCUS_MINUTES_OPTIONS = createMinuteOptions(
  MIN_FOCUS_SECONDS,
  MAX_FOCUS_SECONDS,
  FOCUS_STEP_SECONDS,
);
export const SHORT_BREAK_MINUTES_OPTIONS = createMinuteOptions(
  MIN_SHORT_BREAK_SECONDS,
  MAX_SHORT_BREAK_SECONDS,
  SHORT_BREAK_STEP_SECONDS,
);
export const LONG_BREAK_MINUTES_OPTIONS = createMinuteOptions(
  MIN_LONG_BREAK_SECONDS,
  MAX_LONG_BREAK_SECONDS,
  LONG_BREAK_STEP_SECONDS,
);
