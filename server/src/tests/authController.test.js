import { jest } from "@jest/globals";
import {
  register,
  login,
  logout,
  refreshToken,
} from "../controllers/authController.js";
import { AuthService } from "../services/authService.js";

// Mock dependencies
jest.mock("../services/authService.js");

describe("AuthController", () => {
  let mockAuthService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockAuthService = new AuthService();
    mockRequest = {
      body: {},
      user: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };
      const registeredUser = { id: "1", email: userData.email };
      mockRequest.body = userData;
      mockAuthService.register.mockResolvedValue(registeredUser);

      await register(mockRequest, mockResponse, mockNext);

      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User registered successfully",
        user: registeredUser,
      });
    });

    it("should handle registration error", async () => {
      mockRequest.body = { email: "test@example.com" };
      mockAuthService.register.mockRejectedValue(
        new Error("Registration failed"),
      );

      await register(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const loginData = { email: "test@example.com", password: "password123" };
      const loginResult = {
        accessToken: "token",
        refreshToken: "refresh",
        user: { id: "1" },
      };
      mockRequest.body = loginData;
      mockAuthService.login.mockResolvedValue(loginResult);

      await login(mockRequest, mockResponse, mockNext);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(loginResult);
    });

    it("should handle login error", async () => {
      mockRequest.body = { email: "test@example.com", password: "wrong" };
      mockAuthService.login.mockRejectedValue(new Error("Invalid credentials"));

      await login(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("logout", () => {
    it("should logout user successfully", async () => {
      mockRequest.body = { refreshToken: "token" };
      mockAuthService.logout.mockResolvedValue();

      await logout(mockRequest, mockResponse, mockNext);

      expect(mockAuthService.logout).toHaveBeenCalledWith("token");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const refreshData = { refreshToken: "oldToken" };
      const newTokens = { accessToken: "newToken", refreshToken: "newRefresh" };
      mockRequest.body = refreshData;
      mockAuthService.refreshToken.mockResolvedValue(newTokens);

      await refreshToken(mockRequest, mockResponse, mockNext);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith("oldToken");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(newTokens);
    });
  });
});
