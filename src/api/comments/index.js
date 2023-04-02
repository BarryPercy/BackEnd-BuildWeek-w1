import express from "express";
import createHttpError from "http-errors";
import CommentsModel from "./model.js";
import PostsModel from "../posts/model.js";

const commentsRouter = express.Router();

commentsRouter.post("/:postId/comments", async (req, res, next) => {
  try {
    const post = await PostsModel.findByPk(req.params.postId);
    if(post){
      const comment = await CommentsModel.create({
        ...req.body,
        postId:req.params.postId
      });
      res.send(comment);
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

commentsRouter.get("/:postId/comments", async (req, res, next) => {
  try {
    const post = await PostsModel.findByPk(req.params.postId);
    if (post) {
      const comments = await CommentsModel.findAll({where:{postId:req.params.postId}})
      res.send(comments);
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
    const post = await PostsModel.findByPk(req.params.postId)
    if (!post) {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
    const comment = await CommentsModel.findByPk(req.params.commentId)
    if (!comment) {
      next(
        createHttpError(
          404,
          `Comment with id ${req.params.commentId} not found!`
        )
      );
    }
    res.send(comment);
  } catch (error) {
    next(error);
  }
});



commentsRouter.put("/:postId/comments/:commentId", async (req, res, next) => {
  try {
    const post = await PostsModel.findByPk(req.params.postId);
    if (post) {
      const [numberOfUpdatedRows, updatedRecords] = await CommentsModel.update(req.body, { where: { commentId: req.params.commentId }, returning: true })
      if (numberOfUpdatedRows === 1) {
        res.send(updatedRecords[0])
      } else {
        next(
          createHttpError(
            404,
            `Comment with the id ${req.params.commentId} not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Post with the id: ${req.params.postId} not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

commentsRouter.delete(
  "/:postId/comments/:commentId",
  async (req, res, next) => {
    try {
      const post = await PostsModel.findByPk(req.params.postId);
      if (post) {
        const numberOfDeletedRows = await CommentsModel.destroy({ where: { commentId: req.params.commentId } })
        if (numberOfDeletedRows === 1) {
          res.status(204).send()
        } else {
          next(createError(404, `Post with id ${req.params.id} not found!`));
        }
      } else {
        next(
          createHttpError(
            404,
            `post with the id ${req.params.postId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default commentsRouter;
