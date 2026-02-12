import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import api from "../config/api";
import { queryClient } from "./../libs/queryClient";
import {
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
} from "../config/constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem(AUTH_TOKEN_KEY) || null,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!token;

  // Update localStorage whenever user or token changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, [token]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", credentials);
      console.log(response);
      const { accessToken, user: userData } = response.data;

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/register", userData);
      const { accessToken, user: userPayload } = response.data;

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userPayload));

      setToken(accessToken);
      setUser(userPayload);

      return { success: true, user: userPayload };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      queryClient.clear();
      setToken(null);
      setUser(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await api.post("/auth/refresh", {
        refreshToken: storedRefreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

      setToken(accessToken);
      return { success: true };
    } catch (err) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      setToken(null);
      setUser(null);
      return { success: false, error: err.message };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  //console.log("AuthContext:", context);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
