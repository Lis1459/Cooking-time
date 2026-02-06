import { TagRepository } from "../repositories/tagRepository.js";

const tagRepo = new TagRepository();

export class TagService {
  async getTags() {
    return tagRepo.findAll();
  }

  async createTag(tagData) {
    return tagRepo.create(tagData);
  }

  async updateTag(id, data) {
    return tagRepo.update(id, data);
  }

  async deleteTag(id) {
    return tagRepo.delete(id);
  }
}
