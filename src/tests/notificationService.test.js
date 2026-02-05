import { jest } from "@jest/globals";
import { NotificationService } from "../services/notificationService.js";
import { NotificationRepository } from "../repositories/notificationRepository.js";

// Mock dependencies
jest.mock("../repositories/notificationRepository.js");

describe("NotificationService", () => {
  let notificationService;
  let mockNotificationRepo;

  beforeEach(() => {
    mockNotificationRepo = new NotificationRepository();
    notificationService = new NotificationService();
    jest.clearAllMocks();
  });

  describe("createNotification", () => {
    it("should create notification successfully", async () => {
      const notificationData = {
        message: "New comment on your recipe",
        user_id: "1",
        type: "comment",
      };
      const createdNotification = { id: "1", ...notificationData };
      mockNotificationRepo.create.mockResolvedValue(createdNotification);

      const result =
        await notificationService.createNotification(notificationData);

      expect(mockNotificationRepo.create).toHaveBeenCalledWith(
        notificationData,
      );
      expect(result).toBe(createdNotification);
    });
  });

  describe("getNotificationById", () => {
    it("should return notification by id", async () => {
      const notification = { id: "1", message: "New comment" };
      mockNotificationRepo.findById.mockResolvedValue(notification);

      const result = await notificationService.getNotificationById("1");

      expect(mockNotificationRepo.findById).toHaveBeenCalledWith("1");
      expect(result).toBe(notification);
    });

    it("should throw error if notification not found", async () => {
      mockNotificationRepo.findById.mockResolvedValue(null);

      await expect(
        notificationService.getNotificationById("1"),
      ).rejects.toThrow("Notification not found");
    });
  });

  describe("updateNotification", () => {
    it("should update notification successfully", async () => {
      const notificationId = "1";
      const updateData = { is_read: true };
      const updatedNotification = { id: notificationId, is_read: true };
      mockNotificationRepo.update.mockResolvedValue(updatedNotification);

      const result = await notificationService.updateNotification(
        notificationId,
        updateData,
      );

      expect(mockNotificationRepo.update).toHaveBeenCalledWith(
        notificationId,
        updateData,
      );
      expect(result).toBe(updatedNotification);
    });
  });

  describe("deleteNotification", () => {
    it("should delete notification successfully", async () => {
      mockNotificationRepo.delete.mockResolvedValue({ id: "1" });

      const result = await notificationService.deleteNotification("1");

      expect(mockNotificationRepo.delete).toHaveBeenCalledWith("1");
      expect(result).toHaveProperty("id", "1");
    });
  });

  describe("getNotificationsByUser", () => {
    it("should return notifications by user", async () => {
      const notifications = [{ id: "1", message: "New comment" }];
      mockNotificationRepo.findByUserId.mockResolvedValue(notifications);

      const result = await notificationService.getNotificationsByUser(
        "1",
        1,
        10,
      );

      expect(mockNotificationRepo.findByUserId).toHaveBeenCalledWith(
        "1",
        1,
        10,
      );
      expect(result).toBe(notifications);
    });
  });

  describe("markAsRead", () => {
    it("should mark notification as read", async () => {
      const updatedNotification = { id: "1", is_read: true };
      mockNotificationRepo.update.mockResolvedValue(updatedNotification);

      const result = await notificationService.markAsRead("1");

      expect(mockNotificationRepo.update).toHaveBeenCalledWith("1", {
        is_read: true,
      });
      expect(result.is_read).toBe(true);
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications as read for user", async () => {
      mockNotificationRepo.markAllAsRead.mockResolvedValue({ count: 5 });

      const result = await notificationService.markAllAsRead("1");

      expect(mockNotificationRepo.markAllAsRead).toHaveBeenCalledWith("1");
      expect(result).toHaveProperty("count", 5);
    });
  });
});
