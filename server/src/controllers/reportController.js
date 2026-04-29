import { ReportService } from "../services/reportService.js";
import prisma from "../config/database.js";

const reportService = new ReportService();

export const getReports = async (req, res) => {
  try {
    const filters = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (!filters.status) {
      filters.status = "PENDING";
    }
    const reports = await reportService.getReports(filters, page, limit);
    const total = await reportService.getReportCount(filters);
    res.json({ reports, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    let target = null;
    if (report.target_type === "RECIPE") {
      target = await prisma.recipe.findUnique({
        where: { id: parseInt(report.target_id) },
        select: {
          id: true,
          title: true,
          author_id: true,
        },
      });
    } else if (report.target_type === "COMMENT") {
      target = await prisma.comment.findUnique({
        where: { id: parseInt(report.target_id) },
        select: {
          id: true,
          text: true,
          recipe_id: true,
          user_id: true,
        },
      });
    } else if (report.target_type === "USER") {
      target = await prisma.user.findUnique({
        where: { id: report.target_id },
        select: {
          id: true,
          email: true,
        },
      });
    }

    res.json({ ...report, target });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const { target_type, target_id, reason } = req.body;
    if (
      !target_type ||
      !target_id ||
      !reason ||
      !reason.trim() ||
      !["USER", "RECIPE", "COMMENT"].includes(target_type)
    ) {
      return res.status(400).json({ message: "Invalid report data" });
    }

    if (target_type === "USER") {
      if (target_id === req.user.id) {
        return res.status(400).json({ message: "You cannot report yourself" });
      }
      const targetUser = await prisma.user.findUnique({
        where: { id: target_id },
      });
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    if (target_type === "RECIPE") {
      const recipeId = parseInt(target_id);
      if (Number.isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe id" });
      }
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
      });
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      if (recipe.author_id === req.user.id) {
        return res
          .status(400)
          .json({ message: "You cannot report your own recipe" });
      }
    }

    if (target_type === "COMMENT") {
      const commentId = parseInt(target_id);
      if (Number.isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment id" });
      }
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      if (comment.user_id === req.user.id) {
        return res
          .status(400)
          .json({ message: "You cannot report your own comment" });
      }
    }

    const reportData = {
      reporter_id: req.user.id,
      target_type,
      target_id,
      reason: reason.trim(),
      status: "PENDING",
    };
    const report = await reportService.createReport(reportData);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      reviewed_by_id: req.user.id,
    };
    const report = await reportService.updateReport(req.params.id, updateData);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
