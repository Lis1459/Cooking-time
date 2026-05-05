// API Configuration
export const API_BASE_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api";
export const SOCKET_URL =
  import.meta.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

// Auth Configuration
export const AUTH_TOKEN_KEY = "accessToken";
export const AUTH_TOKEN_UPDATED_AT_KEY = "accessTokenUpdatedAt";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const USER_KEY = "user";

// Pagination
export const DEFAULT_PAGE_SIZE = 12;

// Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Validation
export const MIN_PASSWORD_LENGTH = 6;
export const MIN_RECIPE_TITLE_LENGTH = 3;
export const MIN_RECIPE_DESCRIPTION_LENGTH = 10;

export default {
  API_BASE_URL,
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  DEFAULT_PAGE_SIZE,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  MIN_PASSWORD_LENGTH,
  MIN_RECIPE_TITLE_LENGTH,
  MIN_RECIPE_DESCRIPTION_LENGTH,
};
