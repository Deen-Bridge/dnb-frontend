import { View, Text, ActivityIndicator } from "react-native";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        gap: 16,
      }}
    >
      <ActivityIndicator size="large" color="#092601" />
      {message && (
        <Text style={{ fontSize: 14, color: "#525252" }}>{message}</Text>
      )}
    </View>
  );
}
