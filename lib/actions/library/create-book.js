import axios from "axios";
import config from "@/lib/config/req.header.config";
export async function createBook({ form, thumbnail, file }) {
  const formData = new FormData();
  formData.append("title", form.title);
  formData.append("description", form.description);
  formData.append("category", form.category);
  formData.append("price", form.price);
  if (thumbnail) formData.append("thumbnail", thumbnail);
  if (file) formData.append("file", file);

  const res = await axios.post(
    "https://dnb-backend-api.onrender.com/api/books/",
    formData,
    config
  );
  return res.data;
}
