import { CuisineService } from "../services/cuisineService.js";

const cuisineService = new CuisineService();

export const getCuisines = async (req, res) => {
  try {
    const cuisines = await cuisineService.getCuisines();
    res.json(cuisines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCuisine = async (req, res) => {
  try {
    const cuisine = await cuisineService.createCuisine(req.body);
    res.status(201).json(cuisine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCuisine = async (req, res) => {
  try {
    const cuisine = await cuisineService.updateCuisine(req.params.id, req.body);
    res.json(cuisine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCuisine = async (req, res) => {
  try {
    await cuisineService.deleteCuisine(req.params.id);
    res.json({ message: "Cuisine deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
