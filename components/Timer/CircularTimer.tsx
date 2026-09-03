import { theme } from "@/constants/theme";
import { TimerSession } from "@/constants/types";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularTimerProps {
  timerSession: TimerSession;
  elapsedSeconds: number;
}

const { colors, spacing, typography, radius } = theme;

const circleSize = 228;
const circleStrokeWidth = 6;
const circleRadius = (circleSize - circleStrokeWidth) / 2;
const circleCircumference = 2 * Math.PI * circleRadius;

const formatSecondsIntoMinutes = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${paddedMinutes}:${paddedSeconds}`;
};

export default function CircularTimer({
  timerSession,
  elapsedSeconds,
}: CircularTimerProps) {
  const { timerDurationSeconds, phase, status } = timerSession;

  const secondsRemaining = timerDurationSeconds - elapsedSeconds;

  const progress = Math.min(
    Math.max(elapsedSeconds / timerDurationSeconds, 0),
    1,
  );
  const strokeDashoffset = circleCircumference * (1 - progress);

  const isFocusPhase = phase === "focus";
  const upperCasePhaseName = isFocusPhase
    ? phase.toUpperCase()
    : [phase.slice(0, -5), phase.slice(-5)].join(" ").toUpperCase();
  const shortPhaseName = isFocusPhase ? "Focus" : "Break";

  return (
    <View style={styles.timerArea}>
      <View style={styles.timerRing}>
        <Svg height={circleSize} width={circleSize}>
          <Circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            strokeWidth={circleStrokeWidth}
            r={circleRadius}
            stroke={colors.surfaceElevated}
            fill="transparent"
          />
          <Circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            strokeWidth={circleStrokeWidth}
            r={circleRadius}
            stroke={isFocusPhase ? colors.focus : colors.break}
            fill="transparent"
            strokeDasharray={circleCircumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${circleSize / 2}  ${circleSize / 2})`}
          />
        </Svg>

        <View style={styles.timerCircle}>
          {status !== "ready" && status !== "completed" && (
            <Text
              style={[
                styles.phaseLabel,
                { color: isFocusPhase ? colors.focus : colors.break },
              ]}
            >
              {upperCasePhaseName}
            </Text>
          )}
          <Text style={styles.timerText}>
            {formatSecondsIntoMinutes(secondsRemaining)}
          </Text>
          {status !== "ready" && (
            <Text style={styles.timerStatus}>
              {status === "running"
                ? "in progress"
                : status === "completed"
                  ? `${shortPhaseName} complete`
                  : "paused"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  //Timer
  timerArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  timerRing: {
    alignItems: "center",
    justifyContent: "center",
    width: circleSize,
    aspectRatio: 1,
  },
  timerCircle: {
    position: "absolute",
    width: 208,
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseLabel: {
    ...typography.sectionTitle,
    fontWeight: 400,
    marginBottom: spacing.xxs,
    letterSpacing: 1.6,
  },
  timerText: {
    ...typography.timer,
    color: colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  timerStatus: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
});
