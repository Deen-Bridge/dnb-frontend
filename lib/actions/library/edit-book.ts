import axiosInstance from "@/lib/config/axios.config";

export interface EditBookParams {
  form: {
    title?: string;
    description?: string;
    category?: string;
    price?: string | number;
    [key: string]: any; // TODO(types): Extra edit book form fields
  };
  thumbnail?: File | Blob;
  file?: File | Blob;
}

export async function editBook(bookId: string, { form, thumbnail, file }: EditBookParams): Promise<any> { // TODO(types): Edit book response
  const formData = new FormData();
  if (form.title) formData.append("title", form.title);
  if (form.description) formData.append("description", form.description);
  if (form.category) formData.append("category", form.category);
  if (form.price !== undefined) formData.append("price", String(form.price));
  if (thumbnail) formData.append("thumbnail", thumbnail);
  if (file) formData.append("file", file);

  const res = await axiosInstance.put(`/api/books/${bookId}`, formData);
  return res.data;
}
