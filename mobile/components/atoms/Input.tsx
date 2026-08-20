import { TextInput, View, Text, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#171717" }}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            borderWidth: 1,
            borderColor: error ? "#dc2626" : "#e5e5e5",
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            color: "#171717",
          },
          style,
        ]}
        placeholderTextColor="#a3a3a3"
        {...props}
      />
      {error && (
        <Text style={{ fontSize: 12, color: "#dc2626" }}>{error}</Text>
      )}
    </View>
  );
}
