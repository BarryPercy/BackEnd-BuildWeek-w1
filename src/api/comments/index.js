import express from "express";
import createHttpError from "http-errors";
import CommentsModel from "./model.js";
import PostModel from "../posts/model.js";

const commentsRouter = express.Router();

commentsRouter.get("/:postId/comments", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.postId).populate({
      path: "comments",
      select: "comment user",
      populate: { path: "user", select: "name surname image" },
    });
    if (post) {
      res.send(post.comments);
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
commentsRouter.get("/:postId/comments/:commentId", async (req, res, next) => {
  try {
    const comment = await PostModel.findById(req.params.postId).populate({
      path: "comments",
      select: "comment user",
      populate: { path: "user", select: "name surname image" },
    });
    if (!comment) {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
    const foundComment = comment.comments.filter(
      (e) => e._id.toString() === req.params.commentId
    );
    if (!foundComment) {
      next(
        createHttpError(
          404,
          `Comment with id ${req.params.commentId} not found!`
        )
      );
    }
    res.send(foundComment);
  } catch (error) {
    next(error);
  }
});
commentsRouter.post("/:postId/comments", async (req, res, next) => {
  try {
    const foundPost = await PostModel.findById(req.params.postId);
    if (foundPost) {
      const newComment = new CommentsModel(req.body);
      const { _id } = await newComment.save();
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.postId,
        { $push: { comments: _id } },
        { new: true, runValidators: true }
      );
      res.status(201).send({ updatedPost, _id });
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
commentsRouter.put("/:postId/comments/:commentId", async (req, res, next) => {
  try {
    const foundPost = await PostModel.findById(req.params.postId);
    if (!foundPost) {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }

    const updatedComment = await CommentsModel.findByIdAndUpdate(
      req.params.commentId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedComment) {
      next(
        createHttpError(
          404,
          `Comment with id ${req.params.commentId} not found!`
        )
      );
    }

    res.send(updatedComment);
  } catch (error) {
    next(error);
  }
});
commentsRouter.delete(
  "/:postId/comments/:commentId",
  async (req, res, next) => {
    try {
      const foundPost = await PostModel.findByIdAndUpdate(
        req.params.postId,
        {
          $pull: { comments: req.params.commentId },
        },
        { new: true, runValidators: true }
      );
      if (!foundPost) {
        next(
          createHttpError(404, `Post with id ${req.params.postId} not found!`)
        );
      }
      const deletedComment = await CommentsModel.findByIdAndDelete(
        req.params.commentId
      );
      if (!deletedComment) {
        next(
          createHttpError(
            404,
            `Comment with id ${req.params.commentId} not found!`
          )
        );
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default commentsRouter;
