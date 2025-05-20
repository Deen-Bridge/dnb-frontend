// Fetch a single course by ID from the backend API
import axios from 'axios';

export async function getCourseById(courseId) {
  try {
    const response = await axios.get(
      `https://dnb-backend-api.onrender.com/api/courses/${courseId}`
    );
    if (response.data && response.data.course) {
      return response.data.course;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}
