import axios from "axios";

const BASE_URL = "https://api.real-debrid.com/rest/1.0";

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

// Request interceptor for API token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from secure storage or environment
    const token = process.env.EXPO_PUBLIC_API_TOKEN; // For now using env variable

    if (token) {
      config.headers!.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific API errors here
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          break;
        case 403:
          // Handle forbidden
          break;
        case 429:
          // Handle rate limit
          break;
      }
    }
    return Promise.reject(error);
  },
);
