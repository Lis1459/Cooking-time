import prisma from "../config/database.js";

export class SubscriptionRepository {
  async findByUser(userId) {
    return prisma.subscription.findMany({
      where: { follower_id: userId },
      include: { author: true },
    });
  }

  async findFollowers(authorId) {
    return prisma.subscription.findMany({
      where: { author_id: authorId },
      include: { follower: true },
    });
  }

  async create(subscriptionData) {
    return prisma.subscription.create({
      data: subscriptionData,
    });
  }

  async delete(followerId, authorId) {
    return prisma.subscription.delete({
      where: {
        follower_id_author_id: {
          follower_id: followerId,
          author_id: authorId,
        },
      },
    });
  }

  async isSubscribed(followerId, authorId) {
    const sub = await prisma.subscription.findUnique({
      where: {
        follower_id_author_id: {
          follower_id: followerId,
          author_id: authorId,
        },
      },
    });
    return !!sub;
  }
}
