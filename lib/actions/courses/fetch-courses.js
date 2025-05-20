// Fetch all courses from the backend API
import axios from 'axios';

export async function fetchCourses() {
  try {
    const response = await axios.get(
      "https://dnb-backend-api.onrender.com/api/courses"
    );
    if (response.data && response.data.courses) {
      return response.data.courses;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}
