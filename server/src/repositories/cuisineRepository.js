import prisma from "../config/database.js";

export class CuisineRepository {
  async findAll() {
    return prisma.cuisine.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findById(id) {
    return prisma.cuisine.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async create(cuisineData) {
    return prisma.cuisine.create({
      data: cuisineData,
    });
  }

  async update(id, data) {
    return prisma.cuisine.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  async delete(id) {
    return prisma.cuisine.delete({
      where: { id: parseInt(id) },
    });
  }
}
