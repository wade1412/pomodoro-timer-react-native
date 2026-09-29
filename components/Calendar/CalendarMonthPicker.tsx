import { theme } from "@/constants/theme";
import { SymbolView } from "expo-symbols";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AnimatedPressable from "../ui/AnimatedPressable";
import { DateInfo } from "./calendar.types";

interface CalendarMonthPickerProps {
  selectedPeriodDateInfo: DateInfo;
  todayDateInfo: DateInfo;
  onPreviousPress: () => void;
  onNextPress: () => void;
  onReturnPress: () => void;
}

const { spacing, colors, typography, radius } = theme;

export default function CalendarMonthPicker({
  onNextPress,
  onPreviousPress,
  onReturnPress,
  selectedPeriodDateInfo,
  todayDateInfo,
}: CalendarMonthPickerProps) {
  const isOnCurrentMonth =
    selectedPeriodDateInfo.year === todayDateInfo.year &&
    selectedPeriodDateInfo.month === todayDateInfo.month;
  const returnButtonProgress = useSharedValue(isOnCurrentMonth ? 0 : 1);
  const labelOpacity = useSharedValue(1);

  useEffect(() => {
    returnButtonProgress.value = withTiming(isOnCurrentMonth ? 0 : 1, {
      duration: 240,
      reduceMotion: ReduceMotion.System,
    });
  }, [isOnCurrentMonth, returnButtonProgress]);

  useEffect(() => {
    labelOpacity.value = 0;
    labelOpacity.value = withTiming(1, {
      duration: 160,
      reduceMotion: ReduceMotion.System,
    });
  }, [labelOpacity, selectedPeriodDateInfo.label]);

  const returnButtonAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      returnButtonProgress.value,
      [0, 1],
      [colors.background, colors.surface],
    ),
    borderColor: interpolateColor(
      returnButtonProgress.value,
      [0, 1],
      [colors.border, colors.focus],
    ),
  }));

  const returnButtonTextAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      returnButtonProgress.value,
      [0, 1],
      [colors.textMuted, colors.focus],
    ),
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  return (
    <View style={styles.pickerContainer}>
      <View style={styles.navigationRow}>
        <AnimatedPressable
          accessibilityLabel="Previous month"
          accessibilityRole="button"
          hitSlop={6}
          onPress={onPreviousPress}
          style={({ pressed }) => [
            styles.navigationButton,
            pressed && styles.navigationButtonPressed,
          ]}
        >
          <SymbolView
            name={{
              ios: "chevron.left",
              android: "chevron_left",
              web: "chevron_left",
            }}
            size={20}
            tintColor={colors.textPrimary}
          />
        </AnimatedPressable>

        <View style={styles.labelContainer}>
          <Animated.Text style={[styles.pickerLabel, labelAnimatedStyle]}>
            {selectedPeriodDateInfo.label}
          </Animated.Text>
        </View>

        <AnimatedPressable
          accessibilityLabel="Next month"
          accessibilityRole="button"
          hitSlop={6}
          onPress={onNextPress}
          style={({ pressed }) => [
            styles.navigationButton,
            pressed && styles.navigationButtonPressed,
          ]}
        >
          <SymbolView
            name={{
              ios: "chevron.right",
              android: "chevron_right",
              web: "chevron_right",
            }}
            size={20}
            tintColor={colors.textPrimary}
          />
        </AnimatedPressable>
      </View>

      <AnimatedPressable
        accessibilityLabel="Return to current month"
        accessibilityRole="button"
        accessibilityState={{ disabled: isOnCurrentMonth }}
        onPress={onReturnPress}
        disabled={isOnCurrentMonth}
        containerStyle={[
          styles.returnButtonContainer,
          isOnCurrentMonth && styles.returnButtonContainerDisabled,
          returnButtonAnimatedStyle,
        ]}
        style={({ pressed }) => [
          styles.returnButton,
          pressed && styles.returnButtonPressed,
        ]}
      >
        <Animated.Text
          style={[styles.returnButtonText, returnButtonTextAnimatedStyle]}
        >
          Current month
        </Animated.Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    width: "100%",
    maxWidth: 424,
    alignSelf: "center",
    gap: spacing.sm,
  },
  navigationRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  navigationButton: {
    width: 46,
    height: 46,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  navigationButtonPressed: {
    borderColor: colors.focusPressed,
    backgroundColor: colors.surfaceElevated,
  },
  labelContainer: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerLabel: {
    ...typography.button,
    color: colors.textPrimary,
    textAlign: "center",
  },
  returnButtonContainer: {
    width: "100%",
    height: 42,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  returnButtonContainerDisabled: {
    borderStyle: "dashed",
  },
  returnButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  returnButtonPressed: {
    backgroundColor: colors.focusSoft,
  },
  returnButtonText: {
    ...typography.button,
    textAlign: "center",
  },
});
