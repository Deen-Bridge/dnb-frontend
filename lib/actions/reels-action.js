import axios from "axios";
import config from "../config/req.header.config.js";
// ✅ Get all reels
export const fetchReels = async () => {
  try {
    const res = await axios.get(
      "https://dnb-backend-api.onrender.com/api/reels",
      config
    );
    return res.data;
  } catch (e) {
    console.error("Error fetching reels:", e.message);
    return [];
  }
};

// ✅ Upload a new reel (video: File, with auth header)
export const uploadReel = async (formData) => {
  try {
    const res = await axios.post(
      "https://dnb-backend-api.onrender.com/api/reels",
      formData,
      config
    );

    return res.data;
  } catch (e) {
    console.error("Error uploading reel:", e.message);
    return null;
  }
};
