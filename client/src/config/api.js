import axios from "axios";
import { API_BASE_URL, AUTH_TOKEN_KEY, USER_KEY } from "./constants";
import { toast } from "sonner";
import { navigateTo } from "../services/navigation";
import { logout } from "../services/authService";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    const authHeader = response.headers["authorization"];
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await api.post("/auth/refresh");
        const { accessToken } = refreshResponse.data;
        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (refreshError.response?.status === 401) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          toast.error("Session expired. Please log in again.");
          logout();
          navigateTo("/login");
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
//         const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
//           refreshToken,
//         });

//         const { accessToken, refreshToken: newRefreshToken } = response.data;
//         localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
//         localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

//         api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;

//         return api(originalRequest);
//       } catch (refreshError) {
//         localStorage.removeItem(AUTH_TOKEN_KEY);
//         localStorage.removeItem(REFRESH_TOKEN_KEY);
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

export default api;
