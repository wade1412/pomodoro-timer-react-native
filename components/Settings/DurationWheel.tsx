import { Host, Picker } from "@expo/ui";
import { StyleSheet } from "react-native";

interface DurationWheelProps {
  valueMinutes: number;
  optionsMinutes: readonly number[];
  onValueChange: (minutes: number) => void;
}

export default function DurationWheel({
  valueMinutes,
  optionsMinutes,
  onValueChange,
}: DurationWheelProps) {
  return (
    <Host style={styles.host}>
      <Picker
        appearance="wheel"
        selectedValue={valueMinutes}
        onValueChange={onValueChange}
      >
        {optionsMinutes.map((minutes) => (
          <Picker.Item key={minutes} label={`${minutes} min`} value={minutes} />
        ))}
      </Picker>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    width: "100%",
    height: 210,
  },
});
