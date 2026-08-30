import axiosInstance from "@/lib/config/axios.config";

export interface CreateCourseParams {
  form: {
    title: string;
    description: string;
    price: string | number;
    [key: string]: any; // TODO(types): Extra form fields
  };
  thumbnailUrl?: string;
  videoUrl?: string;
  category?: string;
}

export async function createCourse({ form, thumbnailUrl, videoUrl, category }: CreateCourseParams): Promise<any> { // TODO(types): Course API response
  const courseData = {
    title: form.title,
    description: form.description,
    category: category,
    price: parseFloat(String(form.price)) || 0,
    thumbnail: thumbnailUrl,
    video: videoUrl,
  };

  const res = await axiosInstance.post("/api/courses", courseData);
  return res.data;
}
