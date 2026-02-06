import express from "express";
import {
  getCuisines,
  createCuisine,
  updateCuisine,
  deleteCuisine,
} from "../controllers/cuisineController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/role.js";

const router = express.Router();

router.get("/", getCuisines);
router.post("/", authenticate, requireAdmin, createCuisine);
router.put("/:id", authenticate, requireAdmin, updateCuisine);
router.delete("/:id", authenticate, requireAdmin, deleteCuisine);

export default router;
