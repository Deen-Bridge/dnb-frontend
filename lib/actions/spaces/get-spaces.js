import axios from "axios";

export async function getSpaces() {
  try {
    const res = await axios.get("http://localhost:5000/api/spaces");
    return res.data.spaces; // returns array of spaces
  } catch (error) {
    return [];
  }
}