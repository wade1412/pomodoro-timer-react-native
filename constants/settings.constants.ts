export const SETTINGS_DURATIONS = {
  defaultDurations: {
    focusPhaseSeconds: 25 * 60, // 25 minutes
    shortBreakPhaseSeconds: 5 * 60, // 5 minutes
    longBreakPhaseSeconds: 15 * 60, // 15 minutes
    breakExtensionSeconds: 5 * 60, // 5 minutes
  },

  focusPhase: {
    minSeconds: 10 * 60, // 10 minutes
    stepSeconds: 5 * 60,
    maxSeconds: 60 * 60, // 60 minutes
  },

  shortBreakPhase: {
    minSeconds: 60,
    stepSeconds: 2 * 60,
    maximumValue: 15 * 60, // 15 minutes
  },

  longBreakPhase: {
    minSeconds: 5 * 60, // 5 minutes
    stepSeconds: 5 * 60,
    maxSeconds: 1800, // 30 minutes
  },
};

const { focusPhase, shortBreakPhase, longBreakPhase } = SETTINGS_DURATIONS;

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
  focusPhase.minSeconds,
  focusPhase.maxSeconds,
  focusPhase.stepSeconds,
);
export const SHORT_BREAK_MINUTES_OPTIONS = createMinuteOptions(
  shortBreakPhase.minSeconds,
  shortBreakPhase.maximumValue,
  shortBreakPhase.stepSeconds,
);
export const LONG_BREAK_MINUTES_OPTIONS = createMinuteOptions(
  longBreakPhase.minSeconds,
  longBreakPhase.maxSeconds,
  longBreakPhase.stepSeconds,
);
