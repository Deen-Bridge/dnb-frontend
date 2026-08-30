import axiosInstance from "@/lib/config/axios.config";

export interface EditCourseParams {
  form: {
    title: string;
    description: string;
    category?: string;
    price: string | number;
    lessons?: any[]; // TODO(types): Lesson definitions array
    [key: string]: any; // TODO(types): Extra form properties
  };
  thumbnailUrl?: string;
  videoUrl?: string;
  category?: string;
}

export async function editCourse(
  courseId: string,
  { form, thumbnailUrl, videoUrl, category }: EditCourseParams
): Promise<any> { // TODO(types): Course API response
  const courseData: Record<string, any> = { // TODO(types): Course update payload
    title: form.title,
    description: form.description,
    category: category || form.category,
    price: parseFloat(String(form.price)) || 0,
    lessons: form.lessons || [],
  };

  if (thumbnailUrl) {
    courseData.thumbnail = thumbnailUrl;
  }
  if (videoUrl) {
    courseData.video = videoUrl;
  }

  const res = await axiosInstance.put(`/api/courses/${courseId}`, courseData);
  return res.data;
}
