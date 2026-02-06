import { TagService } from "../services/tagService.js";

const tagService = new TagService();

export const getTags = async (req, res) => {
  try {
    const tags = await tagService.getTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTag = async (req, res) => {
  try {
    const tag = await tagService.createTag(req.body);
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTag = async (req, res) => {
  try {
    const tag = await tagService.updateTag(req.params.id, req.body);
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTag = async (req, res) => {
  try {
    await tagService.deleteTag(req.params.id);
    res.json({ message: "Tag deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
