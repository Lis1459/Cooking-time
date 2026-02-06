import { CommentService } from "../services/commentService.js";

const commentService = new CommentService();

export const getCommentById = async (req, res) => {
  try {
    const comment = await commentService.getCommentById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComments = async (req, res) => {
  //By Recipe
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await commentService.getCommentsByRecipe(
      req.params.recipeId,
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommentsByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await commentService.getCommentsByUser(
      req.params.userId,
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const commentData = {
      recipe_id: parseInt(req.params.recipeId),
      user_id: req.user.id,
      text: req.body.text,
    };
    const comment = await commentService.createComment(commentData);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await commentService.updateComment(req.params.id, req.body);
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    await commentService.deleteComment(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
