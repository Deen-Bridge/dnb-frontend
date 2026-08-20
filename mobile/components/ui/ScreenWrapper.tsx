import { View, Text, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenWrapperProps extends ViewProps {
  title?: string;
  padded?: boolean;
}

export function ScreenWrapper({
  title,
  padded = true,
  children,
  style,
  ...props
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: "#fff",
          paddingTop: insets.top,
          paddingLeft: padded ? 16 : 0,
          paddingRight: padded ? 16 : 0,
          paddingBottom: insets.bottom,
        },
        style,
      ]}
      {...props}
    >
      {title && (
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#092601",
            marginBottom: 16,
          }}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
