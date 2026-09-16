import { TimerSession } from "@/constants/types";

export const getEffectiveElapsedSeconds = (
  timerSession: TimerSession,
  dateNowSeconds: number,
): number => {
  const {
    status,
    startedAtSeconds,
    timerDurationSeconds,
    accumulatedActiveSeconds,
  } = timerSession;

  if (startedAtSeconds !== null && dateNowSeconds < startedAtSeconds) {
    return Math.min(timerDurationSeconds, accumulatedActiveSeconds);
  }

  if (status === "running") {
    if (startedAtSeconds === null) return accumulatedActiveSeconds;
    return Math.min(
      timerDurationSeconds,
      Math.max(dateNowSeconds - startedAtSeconds + accumulatedActiveSeconds, 0),
    );
  }

  return Math.min(timerDurationSeconds, accumulatedActiveSeconds);
};
