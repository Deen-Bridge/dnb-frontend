import axiosInstance from "@/lib/config/axios.config";

export interface CreateBookParams {
  form: {
    title: string;
    description: string;
    category: string;
    price: string | number;
    [key: string]: any; // TODO(types): Extra book form fields
  };
  thumbnail?: File | Blob;
  file?: File | Blob;
}

export async function createBook({ form, thumbnail, file }: CreateBookParams): Promise<any> { // TODO(types): Create book response
  const formData = new FormData();
  formData.append("title", form.title);
  formData.append("description", form.description);
  formData.append("category", form.category);
  formData.append("price", String(form.price));
  if (thumbnail) formData.append("thumbnail", thumbnail);
  if (file) formData.append("file", file);

  const res = await axiosInstance.post("/api/books/", formData);
  return res.data;
}
