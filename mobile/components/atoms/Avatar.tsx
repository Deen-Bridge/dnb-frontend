import { View, Text } from "react-native";

interface AvatarProps {
  name: string;
  uri?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { container: 32, text: 14 },
  md: { container: 48, text: 20 },
  lg: { container: 64, text: 28 },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ name, size = "md" }: AvatarProps) {
  const s = sizes[size];

  return (
    <View
      style={{
        width: s.container,
        height: s.container,
        borderRadius: s.container / 2,
        backgroundColor: "#092601",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: s.text, fontWeight: "600" }}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
