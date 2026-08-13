import axios from "axios";

// Node.js Backend API
const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// FastAPI AI API
const aiApi = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT token
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

// Main API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    console.error("API Error Response:", error.response || error);

    error.formattedMessage = message;

    return Promise.reject(error);
  }
);

// AI API errors
aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to contact AI service";

    console.error("AI API Error Response:", error.response || error);

    error.formattedMessage = message;

    return Promise.reject(error);
  }
);

export { aiApi };
export default api;