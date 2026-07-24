import axiosInstance from "@/lib/config/axios.config";

/**
 * Edit an existing course by ID
 * @param {string} courseId - ID of the course to edit
 * @param {Object} params - Course data (form fields, optional new thumbnailUrl, optional new videoUrl)
 * @returns {Promise<Object>} - Updated course response
 */
export async function editCourse(courseId, { form, thumbnailUrl, videoUrl, category }) {
  const courseData = {
    title: form.title,
    description: form.description,
    category: category || form.category,
    price: parseFloat(form.price) || 0,
    lessons: form.lessons || [],
  };

  if (thumbnailUrl) {
    courseData.thumbnail = thumbnailUrl;
  }
  if (videoUrl) {
    courseData.video = videoUrl;
  }

  const res = await axiosInstance.put(`/api/courses/${courseId}`, courseData);
  return res.data;
}
