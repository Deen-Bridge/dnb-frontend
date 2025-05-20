import axios from "axios";

export async function fetchBooks() {
  const res = await axios.get("http://localhost:5000/api/books");
  return res.data;
}
