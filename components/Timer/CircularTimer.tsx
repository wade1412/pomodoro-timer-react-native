import { theme } from "@/constants/theme";
import { TimerSession } from "@/constants/types";
import { useEffect } from "react";
import { Easing, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
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
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

  const isFocusPhase = phase === "focus";
  const phaseColor = isFocusPhase ? colors.focus : colors.break;
  const phaseSoftColor = isFocusPhase ? colors.focusSoft : colors.breakSoft;
  const upperCasePhaseName = isFocusPhase
    ? phase.toUpperCase()
    : [phase.slice(0, -5), phase.slice(-5)].join(" ").toUpperCase();

  const statusLabel =
    status === "running"
      ? "in progress"
      : status === "completed"
        ? `${isFocusPhase ? "Focus" : "Break"} complete`
        : "paused";

  const secondsRemaining = timerDurationSeconds - elapsedSeconds;

  // ----- Animations -----
  // Progress Animation
  const progress = Math.min(
    Math.max(elapsedSeconds / timerDurationSeconds, 0),
    1,
  );
  const animatedProgress = useSharedValue(progress);
  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 300,
    });
  }, [animatedProgress, progress]);
  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circleCircumference * (1 - animatedProgress.value),
    };
  });
  // Pulse Animation
  const pulseAnimationProgress = useSharedValue(0);
  const pulseAnimationDuration = 1800;
  const pulseAnimationStopDuration = 250;
  useEffect(() => {
    if (status === "running") {
      pulseAnimationProgress.value = withRepeat(
        withTiming(1, {
          duration: pulseAnimationDuration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    } else {
      cancelAnimation(pulseAnimationProgress);
      pulseAnimationProgress.value = withTiming(0, {
        duration: pulseAnimationStopDuration,
      });
    }

    return () => {
      cancelAnimation(pulseAnimationProgress);
    };
  }, [pulseAnimationProgress, status]);
  const glowAnimatedStyle = useAnimatedStyle(() => {
    const scale = 1 + pulseAnimationProgress.value * 0.05;
    const opacity = pulseAnimationProgress.value * 0.14;

    return { transform: [{ scale }], opacity };
  });
  const timerTrackGlowAnimatedStyle = useAnimatedStyle(() => {
    const scale = 1 + pulseAnimationProgress.value * 0.02;
    const opacity = pulseAnimationProgress.value * 0.24;

    return { transform: [{ scale }], opacity };
  });

  return (
    <View style={styles.timerArea}>
      <View style={styles.timerRing}>
        <Animated.View
          style={[
            styles.glowHalo,
            {
              borderColor: phaseSoftColor,
              shadowColor: phaseSoftColor,
            },
            glowAnimatedStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.glowTimerTrack,
            {
              borderColor: phaseColor,
              shadowColor: phaseColor,
            },
            timerTrackGlowAnimatedStyle,
          ]}
        />
        <Svg height={circleSize} width={circleSize}>
          <Circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            strokeWidth={circleStrokeWidth}
            r={circleRadius}
            stroke={colors.surfaceElevated}
            fill="transparent"
          />
          <AnimatedCircle
            animatedProps={animatedProps}
            cx={circleSize / 2}
            cy={circleSize / 2}
            strokeWidth={circleStrokeWidth}
            r={circleRadius}
            stroke={phaseColor}
            fill="transparent"
            strokeDasharray={circleCircumference}
            transform={`rotate(-90 ${circleSize / 2}  ${circleSize / 2})`}
          />
        </Svg>

        <View style={styles.timerCircle}>
          {status !== "ready" && status !== "completed" && (
            <Animated.Text
              style={[styles.phaseLabel, { color: phaseColor }]}
              key={phase}
              entering={FadeIn.duration(250).reduceMotion(ReduceMotion.System)}
              exiting={FadeOut.duration(250).reduceMotion(ReduceMotion.System)}
            >
              {upperCasePhaseName}
            </Animated.Text>
          )}
          <Text style={styles.timerText}>
            {formatSecondsIntoMinutes(secondsRemaining)}
          </Text>
          {status !== "ready" && (
            <Animated.Text
              style={styles.timerStatus}
              entering={FadeIn.duration(250).reduceMotion(ReduceMotion.System)}
              exiting={FadeOut.duration(250).reduceMotion(ReduceMotion.System)}
            >
              {statusLabel}
            </Animated.Text>
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
  glowHalo: {
    position: "absolute",
    width: circleSize + 15,
    aspectRatio: 1,
    borderRadius: radius.round,
    backgroundColor: "transparent",
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
    shadowOpacity: 0.65,
  },
  glowTimerTrack: {
    position: "absolute",
    width: circleSize,
    aspectRatio: 1,
    borderRadius: radius.round,
    backgroundColor: "transparent",
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    shadowOpacity: 0.7,
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
