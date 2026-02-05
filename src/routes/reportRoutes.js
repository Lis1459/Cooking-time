import express from "express";
import {
  getReports,
  createReport,
  updateReport,
} from "../controllers/reportController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/role.js";

const router = express.Router();

router.get("/", authenticate, requireAdmin, getReports);
router.post("/", authenticate, createReport);
router.put("/:id", authenticate, requireAdmin, updateReport);

export default router;
