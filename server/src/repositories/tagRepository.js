import prisma from "../config/database.js";

export class TagRepository {
  async findAll() {
    return prisma.tag.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findById(id) {
    return prisma.tag.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async create(tagData) {
    return prisma.tag.create({
      data: tagData,
    });
  }

  async update(id, data) {
    return prisma.tag.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  async delete(id) {
    return prisma.tag.delete({
      where: { id: parseInt(id) },
    });
  }
}
