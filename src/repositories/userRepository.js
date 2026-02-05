import e from "express";
import prisma from "../config/database.js";

export class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async create(userData) {
    console.log(userData);
    return prisma.user.create({
      data: userData,
    });
  }

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async findAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.user.findMany({
      skip,
      take: limit,
      include: { profile: true },
    });
  }

  async countUsers() {
    return prisma.user.count();
  }
}
