import axiosInstance from "@/lib/config/axios.config";

/**
 * Create a new course
 * Files are uploaded to Cloudinary from frontend before calling this
 * @param {Object} params - Course data with file URLs
 * @returns {Promise<Object>} - Created course data
 */
export async function createCourse({ form, thumbnailUrl, videoUrl, category }) {
  // Send JSON with URLs instead of FormData with files
  const courseData = {
    title: form.title,
    description: form.description,
    category: category,
    price: parseFloat(form.price) || 0,
    thumbnail: thumbnailUrl, // URL from Cloudinary
    video: videoUrl, // URL from Cloudinary
  };

  const res = await axiosInstance.post("/api/courses", courseData);
  return res.data;
}
