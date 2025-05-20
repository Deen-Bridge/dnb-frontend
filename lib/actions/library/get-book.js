import axios from "axios";

export async function getBookById(id) {
  const res = await axios.get(`http://localhost:5000/api/books/${id}`);
  return res.data;
}
