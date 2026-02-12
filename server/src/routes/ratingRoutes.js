import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createRecipeRating,
  // getRecipeRating,
  getUsersRating,
} from "../controllers/ratingController.js";

const router = express.Router({ mergeParams: true });

// router.get("/", getRecipeRating);

router.post("/", authenticate, createRecipeRating);

router.get("/", authenticate, getUsersRating);

export default router;
