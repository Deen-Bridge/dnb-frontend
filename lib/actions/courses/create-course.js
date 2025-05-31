import axios from "axios";
import config from "@/lib/config/req.header.config";

export async function createCourse({ form, thumbnail, video }) {
  const formData = new FormData();
  formData.append("title", form.title);
  formData.append("description", form.description);
  formData.append("category", form.category);
  formData.append("price", form.price);
  if (thumbnail) formData.append("thumbnail", thumbnail);
  if (video) formData.append("video", video);

  const res = await axios.post(
    "https://dnb-backend-api.onrender.com/api/courses/",
    formData,
    config
  );
  return res.data;
}
