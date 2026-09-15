import { theme } from "@/constants/theme";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DurationWheel from "./DurationWheel";

interface DurationPickerSheetProps {
  visible: boolean;
  title: string;
  valueMinutes: number;
  optionsMinutes: readonly number[];
  onValueChange: (minutes: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const { colors, radius, spacing, typography } = theme;

export default function DurationPickerSheet({
  visible,
  title,
  valueMinutes,
  optionsMinutes,
  onValueChange,
  onCancel,
  onConfirm,
}: DurationPickerSheetProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onCancel}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close duration picker"
          accessibilityRole="button"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <View style={styles.titleGroup}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.selectedValue}>{valueMinutes} minutes</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>

          <DurationWheel
            onValueChange={onValueChange}
            optionsMinutes={optionsMinutes}
            valueMinutes={valueMinutes}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 5,
    marginBottom: spacing.md,
    borderRadius: radius.round,
    backgroundColor: colors.border,
  },
  header: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  headerButton: {
    minWidth: 60,
    minHeight: 44,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
  },
  titleGroup: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
  },
  selectedValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  doneText: {
    ...typography.body,
    textAlign: "right",
    color: colors.focus,
  },
});
