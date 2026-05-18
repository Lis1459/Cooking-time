import { IngredientService } from "../services/ingredientService.js";

const ingredientService = new IngredientService();

export const getIngredients = async (req, res) => {
  try {
    const status = req.query.status || "Verified";
    const ingredients = await ingredientService.getIngredients(status);
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createIngredient = async (req, res) => {
  try {
    const ingredientData = {
      ...req.body,
      status: req.body.status || "Verified",
    };
    const ingredient = await ingredientService.createIngredient(ingredientData);
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIngredient = async (req, res) => {
  try {
    const ingredient = await ingredientService.updateIngredient(
      req.params.id,
      req.body,
    );
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteIngredient = async (req, res) => {
  try {
    await ingredientService.deleteIngredient(req.params.id);
    res.json({ message: "Ingredient deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
