import { View, Text, Image, TouchableOpacity } from "react-native";
import { Badge } from "@/components/atoms/Badge";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  onPress?: () => void;
}

export function CourseCard({ course, onPress }: CourseCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e5e5e5",
      }}
    >
      {course.thumbnail && (
        <Image
          source={{ uri: course.thumbnail }}
          style={{ width: "100%", height: 160 }}
          resizeMode="cover"
        />
      )}
      <View style={{ padding: 12, gap: 8 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Badge label={course.level} variant="info" />
          <Badge label={course.category} />
        </View>
        <Text
          style={{ fontSize: 16, fontWeight: "600", color: "#171717" }}
          numberOfLines={2}
        >
          {course.title}
        </Text>
        <Text style={{ fontSize: 14, color: "#525252" }} numberOfLines={2}>
          {course.description}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 14, color: "#525252" }}>
            ⭐ {course.rating.toFixed(1)} ({course.reviewCount})
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#092601" }}>
            ${course.price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
