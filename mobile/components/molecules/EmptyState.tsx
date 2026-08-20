import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export function EmptyState({
  icon = "folder-open-outline",
  title,
  message,
}: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
        gap: 12,
      }}
    >
      <Ionicons name={icon} size={48} color="#a3a3a3" />
      <Text style={{ fontSize: 18, fontWeight: "600", color: "#525252" }}>
        {title}
      </Text>
      {message && (
        <Text
          style={{ fontSize: 14, color: "#737373", textAlign: "center" }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}
