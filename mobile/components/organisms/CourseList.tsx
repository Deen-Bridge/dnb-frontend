import { View, Text, ScrollView } from "react-native";
import { CourseCard } from "@/components/molecules/CourseCard";
import type { Course } from "@/types";

interface CourseListProps {
  courses: Course[];
  title?: string;
  onCoursePress?: (course: Course) => void;
}

export function CourseList({ courses, title, onCoursePress }: CourseListProps) {
  return (
    <View style={{ gap: 12 }}>
      {title && (
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#171717" }}>
          {title}
        </Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {courses.map((course) => (
          <View key={course.id} style={{ marginRight: 12, width: 260 }}>
            <CourseCard course={course} onPress={() => onCoursePress?.(course)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
