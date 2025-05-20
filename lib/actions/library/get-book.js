import axios from "axios";

export async function getBookById(id) {
  const res = await axios.get(
    `https://dnb-backend-api.onrender.com/api/books/${id}`
  );
  return res.data;
}
