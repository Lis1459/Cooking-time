import express from "express";
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
} from "../controllers/reportController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/role.js";

const router = express.Router();

router.get("/", authenticate, requireAdmin, getReports);
router.get("/:id", authenticate, requireAdmin, getReportById);
router.post("/", authenticate, createReport);
router.put("/:id", authenticate, requireAdmin, updateReport);

export default router;
