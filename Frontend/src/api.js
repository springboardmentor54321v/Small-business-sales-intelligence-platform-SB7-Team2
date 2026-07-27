import axios from "axios";

// Node.js Backend API client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// FastAPI AI API client
const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject JWT token to all Node.js backend requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling on Main API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Something went wrong";
    console.error("API Error Response:", error.response || error);
    // Custom error extension
    error.formattedMessage = message;
    return Promise.reject(error);
  }
);

// Response interceptor for error handling on AI API
aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Failed to contact AI service";
    console.error("AI API Error Response:", error.response || error);
    error.formattedMessage = message;
    return Promise.reject(error);
  }
);

export { aiApi };
export default api;