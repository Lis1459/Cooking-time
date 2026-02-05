import prisma from "../config/database.js";

export class NotificationRepository {
  async findByUser(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.notification.findMany({
      where: { user_id: userId },
      skip,
      take: limit,
      include: { initiator: true },
      orderBy: { created_at: "desc" },
    });
  }

  async create(notificationData) {
    return prisma.notification.create({
      data: notificationData,
    });
  }

  async markAsRead(id) {
    return prisma.notification.update({
      where: { id: parseInt(id) },
      data: { is_read: true },
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { user_id: userId },
      data: { is_read: true },
    });
  }

  async countUnread(userId) {
    return prisma.notification.count({
      where: { user_id: userId, is_read: false },
    });
  }
}
