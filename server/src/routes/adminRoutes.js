import express from "express";
import { getAdminStatistics } from "../controllers/adminController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/role.js";

const router = express.Router();

router.get("/statistics", authenticate, requireAdmin, getAdminStatistics);

export default router;
