import prisma from "../config/database.js";

export class CategoryRepository {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findById(id) {
    return prisma.category.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async create(categoryData) {
    return prisma.category.create({
      data: categoryData,
    });
  }

  async update(id, data) {
    return prisma.category.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  async delete(id) {
    return prisma.category.delete({
      where: { id: parseInt(id) },
    });
  }
}
