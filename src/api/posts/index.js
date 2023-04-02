import express from "express";
import createHttpError from "http-errors";
import PostsModel from "./model.js";
import UsersModel from "../users/model.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

const postsRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "posts/image" },
  }),
}).single("image");

postsRouter.get("/", async (req, res, next) => {
  try {
    const query = {}
    const posts = await PostsModel.findAndCountAll({
      where: { ...query },
       limit: req.body.limit,
       offset: req.body.offset});
    res.send(posts)
  } catch (error) {
    next(error);
  }
});

postsRouter.get("/:postId", async (req, res, next) => {
  try {
    const post = await PostsModel.findByPk(req.params.postId, { attributes: { exclude: ["createdAt", "updatedAt"] } }) // attributes could be an array (when you want to pass a list of the selected fields), or an object (with the exclude property, whenever you want to pass a list of omitted fields)
    if (post) {
      res.send(post)
    } else {
      next(createHttpError(404, `Post with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.post("/", async (req, res, next) => {
  try {
    const createObject = {...req.body, 
      image: ""}
    const { postId } = await PostsModel.create(createObject)
    res.status(201).send({ postId });
  } catch (error) {
    next(error);
  }
});

postsRouter.put("/:postId", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows, updatedRecords] = await PostsModel.update(req.body, { where: { postId: req.params.postId }, returning: true })
    if (numberOfUpdatedRows === 1) {
      res.send(updatedRecords[0])
    } else {
      next(createHttpError(404, `Post with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.delete("/:postId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await PostsModel.destroy({ where: { postId: req.params.postId } })
    if (numberOfDeletedRows === 1) {
      res.status(204).send()
    } else {
      next(createError(404, `Post with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.post("/:postId/likes/:userId", async (req, res, next) => {
  try {
    const postToLike = await PostsModel.findById(req.params.postId);
    if (!postToLike)
      return next(
        createHttpError(
          404,
          `Post with the id: ${req.params.postId} not found.`
        )
      );

    const userAboutLike = await UsersModel.findById(req.params.userId);
    if (!userAboutLike)
      return next(
        createHttpError(
          404,
          `User with the id: ${req.params.userId} not found.`
        )
      );

    const isLikedYet = postToLike.likes.includes(req.params.userId);

    if (isLikedYet) {
      const letsDislike = await PostsModel.findByIdAndUpdate(
        { _id: req.params.postId },
        { $pull: { likes: req.params.userId } },
        { new: true, runValidators: true }
      );
      res.send({ LikeLength: letsDislike.likes.length, Liked: false });
    } else {
      const letsLike = await PostsModel.findByIdAndUpdate(
        { _id: req.params.postId },
        { $push: { likes: req.params.userId } },
        { new: true, runValidators: true }
      );
      res.send({ LikeLength: letsLike.likes.length, Liked: true });
    }
  } catch (error) {
    next(error);
  }
});

// ************************ IMAGE ************************

postsRouter.post(
  "/:postId/image",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const imageToAddObject = {
        image:req.file.path,
      }
      const [numberOfUpdatedRows, updatedRecords] = await PostsModel.update(imageToAddObject, { where: { postId: req.params.postId }, returning: true })
      console.log()
      if (numberOfUpdatedRows === 1) {
        res.send(updatedRecords[0])
      } else {
        next(createHttpError(404, `Post with id ${req.params.postId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default postsRouter;
