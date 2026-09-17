import {
  createMonthGrid,
  getDateInfo,
  getMonthlyTracking,
  weekdaysUINames,
} from "@/components/Calendar/calendar.helpers";
import MonthSummary from "@/components/Calendar/MonthSummary";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { theme } from "@/constants/theme";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { usePomodoroContext } from "@/providers/PomodoroProvider";
import { getDateKeyFromDay } from "@/state/tracking.helpers";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing, radius } = theme;
const INITIAL_CALENDAR_DATE = new Date();

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
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const dateInfo = getDateInfo(INITIAL_CALENDAR_DATE);

  const tabBarHeight = useBottomTabBarHeight();

  const calendarGrid = createMonthGrid(dateInfo.year, dateInfo.month);

  const monthlyTracking = getMonthlyTracking(
    trackingHistory,
    dateInfo.year,
    dateInfo.month,
  );

  const getBackgroundColor = (day: string) => {
    if (!day.trim()) return "transparent";

    const dateKey = getDateKeyFromDay(
      dateInfo.year,
      dateInfo.month,
      Number(day),
    );

    if (!trackingHistory[dateKey]) return colors.surface;
    const trackedFocusSeconds = trackingHistory[dateKey].focusSeconds;

    switch (true) {
      case trackedFocusSeconds === 0:
        return colors.surface;
      case trackedFocusSeconds >= dailyGoalSeconds:
        return colors.goalProgressColors.reached;
      case trackedFocusSeconds / dailyGoalSeconds <= 0.25:
        return colors.goalProgressColors.under25;
      case trackedFocusSeconds / dailyGoalSeconds <= 0.5:
        return colors.goalProgressColors.from25To50;
      case trackedFocusSeconds / dailyGoalSeconds <= 0.99:
        return colors.goalProgressColors.from50To99;
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.mainContainer,
          { paddingBottom: tabBarHeight + spacing.md },
        ]}
      >
        <View style={styles.contentColumn}>
          <ScreenHeader title="Calendar" subtitle={dateInfo.label} />

          <View style={styles.calendarHintContainer}>
            <Text style={styles.calendarHintText}>LESS</Text>

            {goalHintArray.map((color) => (
              <View
                key={color}
                style={[styles.calendarHintColor, { backgroundColor: color }]}
              ></View>
            ))}

            <Text style={styles.calendarHintText}>MORE</Text>
          </View>

          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              {weekdaysUINames.map((name, index) => (
                <Text key={index} style={styles.calendarDayName}>
                  {name}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGridContainer}>
              {Object.keys(calendarGrid).map((row, index) => (
                <View key={`${row}-${index}`} style={styles.calendarRow}>
                  {calendarGrid[row].map((day, index) => {
                    const backgroundColor = getBackgroundColor(day);
                    const isEmptyDay = day.trim() === "";
                    const dateKey = isEmptyDay
                      ? null
                      : getDateKeyFromDay(
                          dateInfo.year,
                          dateInfo.month,
                          Number(day),
                        );
                    const isSelected = dateKey === selectedDateKey;
                    const hasDetails = dateKey
                      ? Boolean(trackingHistory[dateKey])
                      : false;
                    const accessibilityLabel = dateKey
                      ? new Date(
                          dateInfo.year,
                          dateInfo.month,
                          Number(day),
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : undefined;

                    return (
                      <Pressable
                        key={`${day}-${index}`}
                        accessibilityHint={
                          hasDetails ? "Shows tracked focus details" : undefined
                        }
                        accessibilityLabel={accessibilityLabel}
                        accessibilityRole="button"
                        accessibilityState={{
                          disabled: isEmptyDay,
                          selected: isSelected,
                        }}
                        disabled={isEmptyDay}
                        onPress={() => {
                          if (dateKey) setSelectedDateKey(dateKey);
                        }}
                        style={[
                          styles.calendarDayContainer,
                          { backgroundColor },
                          isSelected && styles.calendarDaySelected,
                        ]}
                      >
                        <Text style={styles.calendarDayText}>{day}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.monthSummary}>
              <Text style={styles.summaryTitle}>THIS MONTH</Text>

              <MonthSummary monthlyTracking={monthlyTracking} />
            </View>

            <Text style={styles.textHint}>Tap a day to see details</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  contentColumn: {
    width: "100%",
    maxWidth: 320,
    gap: spacing.lg,
  },

  calendarHintContainer: {
    width: "100%",
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
    gap: spacing.xs,
    borderRadius: 2,
  },

  calendarContainer: {
    flexDirection: "column",
    width: "100%",
  },

  calendarHeader: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-around",
    marginBottom: spacing.md,
  },
  calendarDayName: {
    ...typography.caption,
    fontWeight: 400,
    color: colors.textMuted,
    flex: 1,
    maxWidth: "14%",
    textAlign: "center",
  },

  calendarGridContainer: {
    width: "100%",
    flexDirection: "column",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  calendarRow: {
    flexDirection: "row",
    flex: 1,
    width: "100%",
    gap: spacing.xs,
  },
  calendarDayContainer: {
    maxWidth: "14%",
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayText: {
    ...typography.button,
    letterSpacing: 1,
    fontWeight: "400",
    color: colors.textPrimary,
  },
  calendarDaySelected: {
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },

  monthSummary: {
    width: "100%",
    flexDirection: "column",
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.lg,
  },
  summaryTitle: {
    ...typography.body,
    fontWeight: "500",
    color: colors.textMuted,
  },
  textHint: {
    marginTop: spacing.xl,
    textAlign: "center",
    marginHorizontal: "auto",
    color: colors.textMuted,
  },
});
