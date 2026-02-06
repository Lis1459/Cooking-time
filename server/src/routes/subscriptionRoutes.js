import express from "express";
import {
  getSubscriptions,
  getFollowers,
  subscribe,
  unsubscribe,
  isSubscribed,
} from "../controllers/subscriptionController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getSubscriptions);
router.get("/followers/:userId", getFollowers);
router.post("/:userId", authenticate, subscribe);
router.delete("/:userId", authenticate, unsubscribe);
router.get("/:userId/status", authenticate, isSubscribed);

export default router;
