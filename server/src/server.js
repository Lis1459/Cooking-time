import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ingredientRoutes from "./routes/ingredientRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import cuisineRoutes from "./routes/cuisineRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    exposedHeaders: ["Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("public/uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/recipes/:recipeId/comments", commentRoutes);
app.use("/api/recipes/:recipeId/ratings", ratingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/cuisines", cuisineRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
