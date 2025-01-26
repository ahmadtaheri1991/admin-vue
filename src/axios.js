import axios from "axios";
import router from "./router";
// Set base URL for all requests (Optional: replace with your API endpoint)
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // Replace with your API's base URL
  timeout: 10000, // Optional: timeout in ms
  headers: {
    "Content-Type": "application/json",
    // Add any other default headers if needed
  },
});

// You can add interceptors here if needed (e.g., for adding auth tokens)
axiosInstance.interceptors.request.use(
  (config) => {
    // Modify request config here (e.g., add an Authorization header)
    const token = localStorage.authStore
      ? JSON.parse(localStorage.authStore).token
      : null;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Handle the response here
    return response.data;
  },
  (error) => {
    // Handle errors (e.g., for showing error messages to the user)
    if (error.status == 401) {
      router.push("/login");
    } else return Promise.reject(error);
  }
);

export default axiosInstance;
