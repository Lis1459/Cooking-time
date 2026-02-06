import { jest } from "@jest/globals";
import { UserService } from "../services/userService.js";
import { UserRepository } from "../repositories/userRepository.js";

// Mock dependencies
jest.mock("../repositories/userRepository.js");

describe("UserService", () => {
  let userService;
  let mockUserRepo;

  beforeEach(() => {
    mockUserRepo = new UserRepository();
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      const user = { id: "1", email: "test@example.com", name: "Test User" };
      mockUserRepo.findById.mockResolvedValue(user);

      const result = await userService.getUserById("1");

      expect(mockUserRepo.findById).toHaveBeenCalledWith("1");
      expect(result).toBe(user);
    });

    it("should throw error if user not found", async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(userService.getUserById("1")).rejects.toThrow(
        "User not found",
      );
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const userId = "1";
      const updateData = { name: "Updated Name" };
      const updatedUser = {
        id: userId,
        email: "test@example.com",
        name: "Updated Name",
      };
      mockUserRepo.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(mockUserRepo.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toBe(updatedUser);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockUserRepo.delete.mockResolvedValue({ id: "1" });

      const result = await userService.deleteUser("1");

      expect(mockUserRepo.delete).toHaveBeenCalledWith("1");
      expect(result).toHaveProperty("id", "1");
    });
  });

  describe("getAllUsers", () => {
    it("should return paginated users", async () => {
      const users = [{ id: "1", email: "test@example.com" }];
      mockUserRepo.findAll.mockResolvedValue(users);

      const result = await userService.getAllUsers(1, 10);

      expect(mockUserRepo.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(users);
    });
  });

  describe("blockUser", () => {
    it("should block user successfully", async () => {
      const user = { id: "1", is_blocked: false };
      const blockedUser = { id: "1", is_blocked: true };
      mockUserRepo.findById.mockResolvedValue(user);
      mockUserRepo.update.mockResolvedValue(blockedUser);

      const result = await userService.blockUser("1");

      expect(mockUserRepo.update).toHaveBeenCalledWith("1", {
        is_blocked: true,
      });
      expect(result.is_blocked).toBe(true);
    });
  });

  describe("unblockUser", () => {
    it("should unblock user successfully", async () => {
      const user = { id: "1", is_blocked: true };
      const unblockedUser = { id: "1", is_blocked: false };
      mockUserRepo.findById.mockResolvedValue(user);
      mockUserRepo.update.mockResolvedValue(unblockedUser);

      const result = await userService.unblockUser("1");

      expect(mockUserRepo.update).toHaveBeenCalledWith("1", {
        is_blocked: false,
      });
      expect(result.is_blocked).toBe(false);
    });
  });
});
