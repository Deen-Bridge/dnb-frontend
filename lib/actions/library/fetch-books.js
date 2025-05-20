import axios from "axios";

export async function fetchBooks() {
  const res = await axios.get("https://dnb-backend-api.onrender.com/api/books");
  return res.data;
}
