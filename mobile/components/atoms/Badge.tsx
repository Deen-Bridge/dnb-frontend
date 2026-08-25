import { View, Text, type ViewProps } from "react-native";

interface BadgeProps extends ViewProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const variants = {
  default: { bg: "#f5f5f5", text: "#525252" },
  success: { bg: "#f0fdf4", text: "#16a34a" },
  warning: { bg: "#fffbeb", text: "#f59e0b" },
  error: { bg: "#fef2f2", text: "#dc2626" },
  info: { bg: "#eff6ff", text: "#2563eb" },
};

export function Badge({ label, variant = "default", style, ...props }: BadgeProps) {
  const v = variants[variant];

  return (
    <View
      style={[
        {
          backgroundColor: v.bg,
          borderRadius: 9999,
          paddingHorizontal: 10,
          paddingVertical: 4,
          alignSelf: "flex-start",
        },
        style,
      ]}
      {...props}
    >
      <Text style={{ fontSize: 12, fontWeight: "500", color: v.text }}>
        {label}
      </Text>
    </View>
  );
}
