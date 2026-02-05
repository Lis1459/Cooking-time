import { SubscriptionRepository } from "../repositories/subscriptionRepository.js";

const subscriptionRepo = new SubscriptionRepository();

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
    return subscriptionRepo.create({
      follower_id: followerId,
      author_id: authorId,
    });
  }

  async unsubscribe(followerId, authorId) {
    return subscriptionRepo.delete(followerId, authorId);
  }

  async isSubscribed(followerId, authorId) {
    return subscriptionRepo.isSubscribed(followerId, authorId);
  }
}
