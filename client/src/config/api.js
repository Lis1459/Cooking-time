import axios from "axios";
import {
  API_BASE_URL,
  AUTH_TOKEN_KEY,
  AUTH_TOKEN_UPDATED_AT_KEY,
  USER_KEY,
} from "./constants";
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
    config.metadata = { requestStartedAt: Date.now() };
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use((response) => {
  const authHeader = response.headers["authorization"];
  const requestStartedAt = response.config?.metadata?.requestStartedAt || 0;
  const lastAuthUpdate = Number(
    localStorage.getItem(AUTH_TOKEN_UPDATED_AT_KEY) || 0,
  );
  if (authHeader && requestStartedAt >= lastAuthUpdate) {
    const token = authHeader.replace("Bearer ", "");
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_TOKEN_UPDATED_AT_KEY, Date.now().toString());
  }
  return response;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      toast.error("Session expired. Please log in again.");
      logout();
      navigateTo("/login");
      // window.location.href = "/login";
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
