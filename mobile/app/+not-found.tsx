import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function NotFoundScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 48, marginBottom: 16 }}>404</Text>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
        Page not found
      </Text>
      <Text style={{ fontSize: 14, color: "#525252", marginBottom: 24, textAlign: "center" }}>
        The page you are looking for does not exist or has been moved.
      </Text>
      <Link href="/" asChild>
        <TouchableOpacity
          style={{
            backgroundColor: "#092601",
            borderRadius: 8,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Go Home
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
