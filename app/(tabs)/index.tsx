import DailyGoalCard from "@/components/GoalProgressBar/DailyGoalCard";
import CircularTimer from "@/components/Timer/CircularTimer";
import { theme } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing, radius } = theme;

export default function FocusScreen() {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.mainContainer}>
        <View style={styles.contentColumn}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Focus</Text>

            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          <DailyGoalCard />

          {/* Timer Area */}
          <CircularTimer
            durationSeconds={1500}
            secondsRemaining={750}
            phase="focus"
            status="ready"
          />

          {/* Primary Button */}
          <Pressable
            accessibilityRole="button"
            onPress={() => {}}
            style={({ pressed }) => [
              styles.timerButton,
              pressed && styles.timerButtonPressed,
            ]}
          >
            <Text style={styles.timerButtonText}>Start Focus</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  contentColumn: {
    flex: 1,
    width: "100%",
    maxWidth: 320,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    letterSpacing: 1.2,
  },

  // Buttons
  timerButton: {
    width: "100%",
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.focus,
    alignItems: "center",
    justifyContent: "center",
  },
  timerButtonPressed: {
    backgroundColor: colors.focusPressed,
  },
  timerButtonText: {
    ...typography.button,
    color: colors.background,
  },
});
