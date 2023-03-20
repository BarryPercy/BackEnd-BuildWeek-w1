import express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import PostsModel from "./model.js";

const postsRouter = express.Router();

postsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const { posts, total } = await PostsModel.findpostsWithUsers(mongoQuery);
    res.send({
      links: mongoQuery.links(process.env.BE_URL, total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      posts,
    });
  } catch (error) {
    next(error);
  }
});
postsRouter.get("/:id", async (req, res, next) => {
  try {
    const post = await PostsModel.findById(req.params.id);
    if (post) {
      res.send(post);
    } else {
      next(createHttpError(404, `post with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});
postsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new PostsModel(req.body);
    const { _id } = await newPost.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});
postsRouter.put("/id", async (req, res, next) => {
  try {
    const updatedPost = await PostsModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedPost) {
      res.send(updatedPost);
    } else {
      next(createError(404, `post with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});
postsRouter.delete("/:id", async (req, res, next) => {});

export default postsRouter;
