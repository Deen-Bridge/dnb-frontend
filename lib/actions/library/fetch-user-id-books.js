import axios from "axios";

// Fetch books created by a specific user(author) by userId
export async function fetchUserBooks(userId) {
  try {
    const response = await axios.get(
      `https://dnb-backend-api.onrender.com/api/books/by-author/${userId}`
    );
    if (response.data && response.data.books) {
      return response.data.books;
      console.log("Books fetched successfully:", response.data.books);
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching user books:", error);
    return [];
  }
}
