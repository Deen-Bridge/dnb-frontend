import axios from "axios";

// Fetch courses created by a specific user by userId
export async function fetchUserCourses(userId) {
  try {
    console.log("Fetching courses for user ID:", userId);
    const response = await axios.get(
      `http://https://dnb-backend-api.onrender.com/api/courses/user?createdBy=${userId}`
    );
    if (response.data && response.data.courses) {
      return response.data.courses;

    }
    return response.data;
  } catch (error) {
    console.error("Error fetching user courses:", error);
    return [];
  }
}
