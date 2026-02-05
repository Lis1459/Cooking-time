import { jest } from "@jest/globals";
import { AuthService } from "../services/authService.js";
import { UserRepository } from "../repositories/userRepository.js";
import prisma from "../config/database.js";

// Mock dependencies
jest.mock("../repositories/userRepository.js");
jest.mock("../config/database.js");

describe("AuthService", () => {
  let authService;
  let mockUserRepo;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Get the mock constructor
    const MockUserRepository = UserRepository;
    mockUserRepo = new MockUserRepository();

    // Mock the prisma client
    prisma.refreshToken = {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    };

    // Create service instance
    authService = new AuthService();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        id: "1",
        email: userData.email,
        name: userData.name,
      });

      const result = await authService.register(userData);

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(result.email).toBe(userData.email);
    });

    it("should throw error if user already exists", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };
      mockUserRepo.findByEmail.mockResolvedValue({
        id: "1",
        email: userData.email,
      });

      await expect(authService.register(userData)).rejects.toThrow(
        "User already exists",
      );
    });
  });

  describe("login", () => {
    it("should login user with valid credentials", async () => {
      const email = "test@example.com";
      const password = "password123";
      const user = {
        id: "1",
        email,
        password_hash: "$2a$10$hash",
        role: "USER",
        is_blocked: false,
      };
      mockUserRepo.findByEmail.mockResolvedValue(user);
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await authService.login(email, password);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.id).toBe(user.id);
    });

    it("should throw error for invalid credentials", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login("invalid@example.com", "password"),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error for blocked user", async () => {
      const user = { id: "1", email: "test@example.com", is_blocked: true };
      mockUserRepo.findByEmail.mockResolvedValue(user);

      await expect(
        authService.login("test@example.com", "password"),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("logout", () => {
    it("should logout user", async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({});

      await expect(authService.logout("token")).resolves.toBeUndefined();
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: "token" },
      });
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const tokenRecord = { id: "1", user_id: "1" };
      const user = { id: "1", email: "test@example.com", role: "USER" };
      prisma.refreshToken.findUnique.mockResolvedValue(tokenRecord);
      prisma.refreshToken.update.mockResolvedValue({});
      mockUserRepo.findById.mockResolvedValue(user);

      const result = await authService.refreshToken("oldToken");

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should throw error for invalid refresh token", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(authService.refreshToken("invalid")).rejects.toThrow(
        "Invalid refresh token",
      );
    });
  });
});
