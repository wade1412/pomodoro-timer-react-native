import {
  getDateInfo,
  getMonthlyTracking,
} from "@/components/Calendar/calendar.helpers";
import { TimePeriod } from "@/components/Calendar/calendar.types";
import CalendarDayPicker from "@/components/Calendar/CalendarDayPicker";
import CalendarMonthPicker from "@/components/Calendar/CalendarMonthPicker";
import MonthSummary from "@/components/Calendar/MonthSummary";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { layout, theme } from "@/constants/theme";
import { useNowSeconds } from "@/hooks/useNowSeconds";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { usePomodoroContext } from "@/providers/PomodoroProvider";
import { getLocalDateKey } from "@/state/tracking.helpers";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing } = theme;
const { contentColumn, screen } = layout;

const goalHintArray = [
  colors.goalProgressColors.under25,
  colors.goalProgressColors.from25To50,
  colors.goalProgressColors.from50To99,
  colors.goalProgressColors.reached,
];

export default function CalendarScreen() {
  const { state } = usePomodoroContext();
  const { dailyGoalSeconds } = useAppSettings();
  const { trackingHistory } = state;
  const { nowSeconds } = useNowSeconds();

  const todayDateInfo = getDateInfo(new Date(nowSeconds * 1000));
  const todayDateKey = getLocalDateKey(nowSeconds);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>({
    year: todayDateInfo.year,
    month: todayDateInfo.month,
  });

  const selectedPeriodDateInfo = getDateInfo(
    new Date(selectedPeriod.year, selectedPeriod.month, 1),
  );

  const onPrevMonthPress = () =>
    setSelectedPeriod((prev) => {
      let newYear = prev.year;
      let newMonth = prev.month - 1;
      if (newMonth < 0) {
        return {
          year: newYear - 1,
          month: 11,
        };
      }
      return {
        year: newYear,
        month: newMonth,
      };
    });

  const onNextMonthPress = () =>
    setSelectedPeriod((prev) => {
      let newYear = prev.year;
      let newMonth = prev.month + 1;
      if (newMonth > 11) {
        return {
          year: newYear + 1,
          month: 0,
        };
      }

      return {
        year: newYear,
        month: newMonth,
      };
    });

  const onReturnToCurrentMonthPress = () =>
    setSelectedPeriod({
      year: todayDateInfo.year,
      month: todayDateInfo.month,
    });

  const monthlyTracking = getMonthlyTracking(
    trackingHistory,
    selectedPeriod.year,
    selectedPeriod.month,
  );

  const tabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={screen}>
      <ScrollView
        contentContainerStyle={[
          styles.mainContainer,
          { paddingBottom: tabBarHeight + spacing.md },
        ]}
      >
        <View style={contentColumn}>
          <View style={styles.headerSection}>
            <ScreenHeader title="Calendar" />

            <View style={styles.hintAndMonthPickerContainer}>
              <View style={styles.calendarHintContainer}>
                <Text style={styles.calendarHintText}>LESS</Text>

                {goalHintArray.map((color) => (
                  <View
                    key={color}
                    style={[
                      styles.calendarHintColor,
                      { backgroundColor: color },
                    ]}
                  ></View>
                ))}

                <Text style={styles.calendarHintText}>MORE</Text>
              </View>

              <CalendarMonthPicker
                selectedPeriodDateInfo={selectedPeriodDateInfo}
                todayDateInfo={todayDateInfo}
                onPreviousPress={onPrevMonthPress}
                onNextPress={onNextMonthPress}
                onReturnPress={onReturnToCurrentMonthPress}
              />
            </View>
          </View>

          <CalendarDayPicker
            todayDateKey={todayDateKey}
            selectedDateInfo={selectedPeriodDateInfo}
            dailyGoalSeconds={dailyGoalSeconds}
            trackingHistory={trackingHistory}
          />

          <MonthSummary monthlyTracking={monthlyTracking} />

          <Text style={styles.textHint}>Tap a day to see details</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  headerSection: {
    gap: spacing.xs,
  },
  hintAndMonthPickerContainer: {
    width: "100%",
    gap: spacing.md,
  },
  calendarHintContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: spacing.sm,
  },
  calendarHintText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  calendarHintColor: {
    aspectRatio: 1,
    width: "5%",
    maxWidth: 20,
    gap: spacing.xs,
    borderRadius: 2,
  },
  textHint: {
    marginTop: spacing.lg,
    textAlign: "center",
    marginHorizontal: "auto",
    color: colors.textMuted,
  },
});
