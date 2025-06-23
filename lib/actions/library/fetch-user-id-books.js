import axiosInstance from "@/lib/config/axios.config";

// Fetch books created by a specific user(author) by userId
export async function fetchUserBooks(userId) {
  try {
    const response = await axiosInstance.get(`/api/books/by-author/${userId}`);
    if (response.data && response.data.books) {
      console.log("Fetched books:", response.data.books);
      return response.data.books;
    }
    return response.data;
  } catch (error) {
    console.log("Error fetching user books:", error);
    return [];
  }
}
