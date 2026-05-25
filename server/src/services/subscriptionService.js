import { SubscriptionRepository } from "../repositories/subscriptionRepository.js";
import { NotificationService } from "./notificationService.js";

const subscriptionRepo = new SubscriptionRepository();
const notificationService = new NotificationService();

export class SubscriptionService {
  async getUserSubscriptions(userId) {
    return subscriptionRepo.findByUser(userId);
  }

  async getFollowers(authorId) {
    return subscriptionRepo.findFollowers(authorId);
  }

  async subscribe(followerId, authorId) {
    if (followerId === authorId) {
      throw new Error("Cannot subscribe to yourself");
    }
    const isSubscribed = await subscriptionRepo.isSubscribed(
      followerId,
      authorId,
    );
    if (isSubscribed) {
      throw new Error("Already subscribed");
    }
    const subscription = await subscriptionRepo.create({
      follower_id: followerId,
      author_id: authorId,
    });

    await notificationService.createNotification({
      user_id: authorId,
      initiator_id: followerId,
      type: "NEW_FOLLOWER",
      entity_id: followerId,
      message: "Новый подписчик на ваш профиль",
    });

    return subscription;
  }

  async unsubscribe(followerId, authorId) {
    return subscriptionRepo.delete(followerId, authorId);
  }

  async isSubscribed(followerId, authorId) {
    return subscriptionRepo.isSubscribed(followerId, authorId);
  }
}
