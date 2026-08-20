import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variants = {
  primary: {
    container: { backgroundColor: "#092601" },
    text: { color: "#ffffff" },
  },
  secondary: {
    container: { backgroundColor: "#f5f5f5" },
    text: { color: "#171717" },
  },
  outline: {
    container: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#e5e5e5" },
    text: { color: "#171717" },
  },
  ghost: {
    container: { backgroundColor: "transparent" },
    text: { color: "#092601" },
  },
  danger: {
    container: { backgroundColor: "#dc2626" },
    text: { color: "#ffffff" },
  },
};

const sizes = {
  sm: { container: { paddingVertical: 8, paddingHorizontal: 16 }, text: { fontSize: 14 } },
  md: { container: { paddingVertical: 12, paddingHorizontal: 20 }, text: { fontSize: 16 } },
  lg: { container: { paddingVertical: 16, paddingHorizontal: 24 }, text: { fontSize: 18 } },
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <TouchableOpacity
      disabled={disabled || isLoading}
      style={[
        {
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          opacity: disabled || isLoading ? 0.6 : 1,
        },
        v.container,
        s.container,
        style,
      ]}
      {...props}
    >
      {isLoading && <ActivityIndicator size="small" color={v.text.color} />}
      <Text style={[{ fontWeight: "600" }, v.text, s.text]}>{title}</Text>
    </TouchableOpacity>
  );
}
