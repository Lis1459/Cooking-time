import prisma from "../config/database.js";

export class ReportRepository {
  async findById(id) {
    return prisma.report.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.target_type) where.target_type = filters.target_type;

    return prisma.report.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async create(reportData) {
    return prisma.report.create({
      data: reportData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id, data) {
    return prisma.report.update({
      where: { id: parseInt(id) },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async count(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.target_type) where.target_type = filters.target_type;

    return prisma.report.count({ where });
  }
}
