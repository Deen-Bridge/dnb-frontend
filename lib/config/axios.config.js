import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://dnb-backend-api.onrender.com", // Backend URL
  withCredentials: true, // Ensures cookies are sent with requests
});

export default axiosInstance;
