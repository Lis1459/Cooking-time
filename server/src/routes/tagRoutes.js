import express from "express";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/tagController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/role.js";

const router = express.Router();

router.get("/", getTags);
router.post("/", authenticate, requireAdmin, createTag);
router.put("/:id", authenticate, requireAdmin, updateTag);
router.delete("/:id", authenticate, requireAdmin, deleteTag);

export default router;
