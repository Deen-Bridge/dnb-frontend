import axios from "axios";
import config from "@/lib/config/req.header.config";
export async function getSpaceById(id) {
  const res = await axios.get(
    `http://localhost:5000/api/spaces/${id}`, config
  );
  return res.data.space; // Only return the space object
}

