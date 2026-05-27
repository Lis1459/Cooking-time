import express from "express";
import {
  getRecipe,
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getPopularRecipes,
  getMyRecipes,
  approveRecipe,
  rejectRecipe,
  getPendingRecipes,
  getRecipeWithDraft,
  addToFavorites,
  removeFromFavorites,
  markRecipeStatus,
  registerRecipeView,
  smartSearch,
} from "../controllers/recipeController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/role.js";
import { uploadRecipeImage } from "../middleware/upload.js";

const router = express.Router();

router.get("/popular", getPopularRecipes);
router.get("/smart-search", smartSearch);
router.get("/", getRecipes);
router.get("/my", authenticate, getMyRecipes);
router.get("/pending", authenticate, requireAdmin, getPendingRecipes);
router.get("/:id", getRecipe);
router.post("/", authenticate, uploadRecipeImage, createRecipe);
router.put("/:id", authenticate, uploadRecipeImage, updateRecipe);
router.delete("/:id", authenticate, deleteRecipe);
router.get("/:id/draft", authenticate, requireAdmin, getRecipeWithDraft);

router.put("/:id/approve", authenticate, requireAdmin, approveRecipe);
router.delete("/:id/reject", authenticate, requireAdmin, rejectRecipe);

router.post("/:id/favorite", authenticate, addToFavorites);
router.delete("/:id/favorite", authenticate, removeFromFavorites);
router.post("/:id/view", registerRecipeView);
router.post("/:id/cook", authenticate, markRecipeStatus);

export default router;
