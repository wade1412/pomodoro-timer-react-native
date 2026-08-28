import { theme } from "@/constants/theme";
import { Pressable, StyleSheet, Text } from "react-native";

const { colors, typography, radius } = theme;

interface TimerControlsProps {
  onPress: () => void;
  buttonText: string;
  isFocusPhase: boolean;
}

export default function TimerControls({
  onPress,
  buttonText,
  isFocusPhase,
}: TimerControlsProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.timerButton,
        {
          backgroundColor: isFocusPhase ? colors.focus : colors.break,
        },
        pressed && {
          backgroundColor: isFocusPhase
            ? colors.focusPressed
            : colors.breakPressed,
        },
      ]}
    >
      <Text style={styles.timerButtonText}>{buttonText}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Buttons
  timerButton: {
    width: "100%",
    height: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  timerButtonText: {
    ...typography.button,
    color: colors.background,
  },
});
