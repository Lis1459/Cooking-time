import prisma from "../config/database.js";

export class IngredientRepository {
  async findAll() {
    return prisma.ingredient.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findById(id) {
    return prisma.ingredient.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async create(ingredientData) {
    return prisma.ingredient.create({
      data: ingredientData,
    });
  }

  async update(id, data) {
    return prisma.ingredient.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  async delete(id) {
    return prisma.ingredient.delete({
      where: { id: parseInt(id) },
    });
  }

  async count() {
    return prisma.ingredient.count();
  }
}
