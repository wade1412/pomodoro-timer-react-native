import { theme } from "@/constants/theme";
import { Pressable, StyleSheet, Text } from "react-native";

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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        isRoundEnd ? styles.endRoundButton : styles.endPhaseButton,
        pressed && {
          borderColor: colors.textMuted,
        },
      ]}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
