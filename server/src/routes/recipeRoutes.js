import express from "express";
import {
  getRecipe,
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getPopularRecipes,
  addToFavorites,
  removeFromFavorites,
  markRecipeStatus,
  smartSearch,
} from "../controllers/recipeController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/role.js";
import { uploadRecipeImage } from "../middleware/upload.js";

const router = express.Router();

router.get("/popular", getPopularRecipes);
router.get("/smart-search", smartSearch);
router.get("/", getRecipes);
router.get("/:id", getRecipe);
router.post("/", authenticate, uploadRecipeImage, createRecipe);
router.put("/:id", authenticate, updateRecipe);
router.delete("/:id", authenticate, deleteRecipe);

router.post("/:id/favorite", authenticate, addToFavorites);
router.delete("/:id/favorite", authenticate, removeFromFavorites);
router.post("/:id/cook", authenticate, markRecipeStatus);

export default router;
