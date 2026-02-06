import { jest } from "@jest/globals";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notificationController.js";
import { NotificationService } from "../services/notificationService.js";

// Mock dependencies
jest.mock("../services/notificationService.js");

describe("NotificationController", () => {
  let mockNotificationService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockNotificationService = new NotificationService();
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: { id: "1" },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("getNotifications", () => {
    it("should return notifications by user", async () => {
      const notifications = [{ id: "1", message: "New comment" }];
      mockRequest.query = { page: "1", limit: "10" };
      mockNotificationService.getUserNotifications.mockResolvedValue(
        notifications,
      );

      await getNotifications(mockRequest, mockResponse, mockNext);

      expect(mockNotificationService.getUserNotifications).toHaveBeenCalledWith(
        "1",
        1,
        10,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(notifications);
    });
  });

  describe("markAsRead", () => {
    it("should mark notification as read", async () => {
      mockRequest.params.id = "1";
      mockNotificationService.markAsRead.mockResolvedValue({
        id: "1",
        is_read: true,
      });

      await markAsRead(mockRequest, mockResponse, mockNext);

      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Notification marked as read",
      });
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications as read", async () => {
      mockNotificationService.markAllAsRead.mockResolvedValue({ count: 5 });

      await markAllAsRead(mockRequest, mockResponse, mockNext);

      expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "All notifications marked as read",
      });
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread count", async () => {
      const count = 3;
      mockNotificationService.getUnreadCount.mockResolvedValue(count);

      await getUnreadCount(mockRequest, mockResponse, mockNext);

      expect(mockNotificationService.getUnreadCount).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({ unreadCount: count });
    });
  });
});
