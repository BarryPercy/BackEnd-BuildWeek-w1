import express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import CommentsModel from "./model.js";

const commentsRouter = express.Router();

commentsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const { comments, total } = await CommentsModel.findcommentsWithPosts(
      mongoQuery
    );
    res.send({
      links: mongoQuery.links(process.env.BE_URL, total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      comments,
    });
  } catch (error) {
    next(error);
  }
});
commentsRouter.get("/:id", async (req, res, next) => {
  try {
    const comment = await CommentsModel.findById(req.params.id);
    if (comment) {
      res.send(comment);
    } else {
      next(createHttpError(404, `Comment with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});
commentsRouter.post("/", async (req, res, next) => {
  try {
    const newcomment = new commentsModel(req.body);
    const { _id } = await newcomment.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});
commentsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedComment = await CommentsModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedComment) {
      res.send(updatedComment);
    } else {
      next(createHttpError(404, `Comment with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});
commentsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedComment = await CommentsModel.findByIdAndDelete(req.params.id);
    if (deletedComment) {
      res.status(204).send();
    } else {
      next(createError(404, `Comment with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default commentsRouter;
