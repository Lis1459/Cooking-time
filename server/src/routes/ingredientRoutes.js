import express from "express";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../controllers/ingredientController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/role.js";

const router = express.Router();

router.get("/", getIngredients);
router.post("/", authenticate, requireAdmin, createIngredient);
router.put("/:id", authenticate, requireAdmin, updateIngredient);
router.delete("/:id", authenticate, requireAdmin, deleteIngredient);

export default router;
