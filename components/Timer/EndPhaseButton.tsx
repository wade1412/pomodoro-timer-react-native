import { theme } from "@/constants/theme";
import { StyleSheet, Text } from "react-native";
import AnimatedPressable from "../ui/AnimatedPressable";

const { colors, typography, radius, spacing } = theme;

interface EndPhaseButtonProps {
  isRoundEnd?: boolean;
  label: string;
  onPress: () => void;
}

export default function EndPhaseButton({
  isRoundEnd = false,
  onPress,
  label,
}: EndPhaseButtonProps) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      containerStyle={styles.buttonWrapper}
      style={isRoundEnd ? styles.endRoundButton : styles.endPhaseButton}
    >
      {({ pressed }) => (
        <Text
          style={[
            isRoundEnd ? styles.endRoundButtonText : styles.endPhaseText,
            pressed && {
              color: colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    width: "100%",
  },
  endRoundButton: {
    height: 46,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
  },
  endPhaseButton: {
    height: 46,
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  endRoundButtonText: {
    ...typography.button,
    color: colors.textPrimary,
    fontWeight: 400,
  },
  endPhaseText: {
    ...typography.button,
    color: colors.textMuted,
    fontWeight: 400,
  },
});
