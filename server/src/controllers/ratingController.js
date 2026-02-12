import { RatingService } from "../services/ratingService.js";

const ratingService = new RatingService();

// export const getRecipeRating = async (req, res) => {
//   try {
//     const rating = await ratingService.getRecipeRating(req.params.recipeId);
//     console.log("rating", rating);
//     res.json(rating);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const createRecipeRating = async (req, res) => {
  try {
    const { score } = req.body;
    const userId = req.user.id;
    const rating = await ratingService.upsertRecipeRating(
      req.params.recipeId,
      userId,
      score,
    );
    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsersRating = async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const userId = req.user.id;
    const rating = await ratingService.getUsersRating(recipeId, userId);
    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
