import { CuisineRepository } from "../repositories/cuisineRepository.js";

const cuisineRepo = new CuisineRepository();

export class CuisineService {
  async getCuisines() {
    return cuisineRepo.findAll();
  }

  async createCuisine(cuisineData) {
    return cuisineRepo.create(cuisineData);
  }

  async updateCuisine(id, data) {
    return cuisineRepo.update(id, data);
  }

  async deleteCuisine(id) {
    return cuisineRepo.delete(id);
  }
}
