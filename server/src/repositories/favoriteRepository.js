import prisma from "../config/database.js";

export class FavoriteRepository {
  async exists(user_id, recipe_id) {
    try {
      const favorite = await prisma.favorite.findUnique({
        where: {
          user_id_recipe_id: {
            user_id,
            recipe_id: parseInt(recipe_id),
          },
        },
      });

      return !!favorite;
    } catch (err) {
      console.log(err.message);
    }
  }
}
