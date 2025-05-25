import axios from "axios";
import config from "@/lib/config/req.header.config";
export async function getSpaceById(id) {
  const res = await axios.get(
    `https://dnb-backend-api.onrender.com/api/spaces/${id}`,config
  );
  return res.data;
}
