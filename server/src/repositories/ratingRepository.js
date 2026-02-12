import prisma from "../config/database.js";

export class RatingRepository {
  // async get(recipeId) {
  //   return await prisma.rating.aggregate({
  //     where: { recipe_id: parseInt(recipeId) },
  //     _avg: { rating: true },
  //     _count: { rating: true },
  //   });
  // }

  async upsert(recipeId, userId, rating) {
    return await prisma.rating.upsert({
      where: {
        recipe_id_user_id: {
          recipe_id: parseInt(recipeId),
          user_id: userId,
        },
      },
      update: { rating },
      create: {
        user_id: userId,
        recipe_id: parseInt(recipeId),
        rating,
      },
    });
  }

  async get(recipeId, userId) {
    return await prisma.rating.findUnique({
      where: {
        recipe_id_user_id: {
          recipe_id: parseInt(recipeId),
          user_id: userId,
        },
      },
    });
  }
}
