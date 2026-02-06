import prisma from "../config/database.js";

export class CommentRepository {
  async findById(id) {
    return prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: { user: true, recipe: true },
    });
  }

  async findByRecipe(recipeId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.comment.findMany({
      where: { recipe_id: parseInt(recipeId), is_hidden: false },
      skip,
      take: limit,
      include: { user: true },
      orderBy: { created_at: "desc" },
    });
  }

  async create(commentData) {
    return prisma.comment.create({
      data: commentData,
      include: { user: true },
    });
  }

  async update(id, data) {
    return prisma.comment.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  async delete(id) {
    return prisma.comment.delete({
      where: { id: parseInt(id) },
    });
  }

  async countByRecipe(recipeId) {
    return prisma.comment.count({
      where: { recipe_id: parseInt(recipeId), is_hidden: false },
    });
  }
}
