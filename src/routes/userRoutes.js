import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/role.js";

const router = express.Router();

router.get("/profile/:id", authenticate, getUserProfile);
router.put("/profile/:id", authenticate, updateUserProfile);
router.get("/", authenticate, requireAdmin, getAllUsers);
router.put("/:id/block", authenticate, requireAdmin, blockUser);
router.put("/:id/unblock", authenticate, requireAdmin, unblockUser);
router.delete("/:id", authenticate, requireAdmin, deleteUser);

export default router;
