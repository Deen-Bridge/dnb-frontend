import axios from "axios";

export async function getSpaces() {
  try {
    const res = await axios.get("https://dnb-backend-api.onrender.com/api/spaces");
    return res.data.spaces; // returns array of spaces
  } catch (error) {
    return [];
  }
}