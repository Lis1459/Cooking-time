import { NotificationRepository } from "../repositories/notificationRepository.js";

const notificationRepo = new NotificationRepository();

export class NotificationService {
  async getNotificationById(id) {
    return notificationRepo.findById(id);
  }

  async getUserNotifications(userId, page, limit) {
    return notificationRepo.findByUser(userId, page, limit);
  }

  async getNotificationsByUser(userId, page, limit) {
    return notificationRepo.findByUser(userId, page, limit);
  }

  async createNotification(notificationData) {
    return notificationRepo.create(notificationData);
  }

  async updateNotification(id, data) {
    return notificationRepo.update(id, data);
  }

  async deleteNotification(id) {
    return notificationRepo.delete(id);
  }

  async markAsRead(id) {
    return notificationRepo.markAsRead(id);
  }

  async markAllAsRead(userId) {
    return notificationRepo.markAllAsRead(userId);
  }

  async getUnreadCount(userId) {
    return notificationRepo.countUnread(userId);
  }
}
