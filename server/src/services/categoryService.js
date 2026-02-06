import { CategoryRepository } from "../repositories/categoryRepository.js";

const categoryRepo = new CategoryRepository();

export class CategoryService {
  async getCategories() {
    return categoryRepo.findAll();
  }

  async createCategory(categoryData) {
    return categoryRepo.create(categoryData);
  }

  async updateCategory(id, data) {
    return categoryRepo.update(id, data);
  }

  async deleteCategory(id) {
    return categoryRepo.delete(id);
  }
}
