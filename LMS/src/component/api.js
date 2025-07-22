import axios from "axios";

// ✅ Use Vite env variable instead of process.env
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: backendUrl,
});

// ✅ Attach JWT token automatically if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Utility: Check if JWT is expired
export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000; // exp is in seconds → convert to ms
  } catch (e) {
    return true;
  }
}

export default axiosInstance;
