import axiosInstance from "@/lib/config/axios.config";
import config from "@/lib/config/req.header.config";

export async function createCourse({ form, thumbnail, video, category }) {
  const formData = new FormData();
  formData.append("title", form.title);
  formData.append("description", form.description);
  formData.append("category", category);
  formData.append("price", form.price);
  if (thumbnail) formData.append("thumbnail", thumbnail);
  if (video) formData.append("video", video);

  const res = await axiosInstance.post("/api/courses/", formData, config);
  return res.data;
}
