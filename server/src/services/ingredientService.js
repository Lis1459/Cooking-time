import { IngredientRepository } from "../repositories/ingredientRepository.js";

const ingredientRepo = new IngredientRepository();

export class IngredientService {
  async getIngredientById(id) {
    return ingredientRepo.findById(id);
  }

  async getIngredients(page, limit) {
    return ingredientRepo.findAll(page, limit);
  }

  async getAllIngredients(page, limit) {
    return ingredientRepo.findAll(page, limit);
  }

  async createIngredient(ingredientData) {
    return ingredientRepo.create(ingredientData);
  }

  async updateIngredient(id, data) {
    return ingredientRepo.update(id, data);
  }

  async deleteIngredient(id) {
    return ingredientRepo.delete(id);
  }

  async searchIngredients(query, page, limit) {
    return ingredientRepo.search(query, page, limit);
  }

  async getIngredientCount() {
    return ingredientRepo.count();
  }
}
