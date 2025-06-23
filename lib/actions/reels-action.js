import axiosInstance from "@/lib/config/axios.config";
import config from "../config/req.header.config.js";
// ✅ Get all reels
export const fetchReels = async () => {
  try {
    const res = await axiosInstance.get("/api/reels", config);
    return res.data;
  } catch (e) {
    console.log("Error fetching reels:", e.message);
    return [];
  }
};

// ✅ Upload a new reel (video: File, with auth header)
export const uploadReel = async (formData) => {
  try {
    const res = await axiosInstance.post("/api/reels", formData, config);

    return res.data;
  } catch (e) {
    console.log("Error uploading reel:", e.message);
    return null;
  }
};
