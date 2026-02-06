import express from "express";
import {
  register,
  login,
  logout,
  refresh,
} from "../controllers/authController.js";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/validation.js";
import { loginLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/register", validateRegistration, register);
router.post("/login", loginLimiter, validateLogin, login);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
