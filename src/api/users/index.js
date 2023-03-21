import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import UsersModel from "./model.js";
import { v2 as cloudinary } from "cloudinary";

const usersRouter = Express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "users/image" },
  }),
}).single("image");

usersRouter.post("/", async (req, res, next) => {
  try {
    const userToAdd = {
      ...req.body,
      image: "https://picsum.photos/200/300",
      experiences: [],
    };
    const newUser = new UsersModel(userToAdd);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(
        createHttpError(
          404,
          `User with the id: ${req.params.userId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(
        createHttpError(
          404,
          `User with the id: ${req.params.userId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

// ************************ PROFILE PICTURE ************************

usersRouter.post(
  "/:userId/image",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { image: req.file.path },
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(createError(404, `User with id ${req.params.userId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

// ************************ FRIENDS ************************

usersRouter.post(
  "/:senderId/friendrequest/:reciverId",
  async (req, res, next) => {
    try {
      const sender = await UsersModel.findById(req.params.senderId);
      if (!sender)
        return next(
          createHttpError(
            404,
            `User with the id: ${req.params.senderId} not found.`
          )
        );
      const reciver = await UsersModel.findById(req.params.reciverId);
      if (!reciver)
        return next(
          createHttpError(
            404,
            `User with the id: ${req.params.reciverId} not found.`
          )
        );

      const isSent = await UsersModel.findOne({
        "social.sent": req.params.reciverId,
      });

      if (isSent) {
        const letsUnSend = await UsersModel.findOneAndUpdate(
          req.params.senderId,
          { $pull: { "social.sent": req.params.reciverId } },
          { new: true, runValidators: true }
        );
        const letsUnPending = await UsersModel.findByIdAndUpdate(
          req.params.reciverId,
          { $pull: { "social.pending": req.params.senderId } },
          { new: true, runValidators: true }
        );
        res.send({ letsUnSend, letsUnPending });
      } else {
        const letsSend = await UsersModel.findOneAndUpdate(
          req.params.senderId,
          { $push: { "social.sent": req.params.reciverId } },
          { new: true, runValidators: true }
        );
        const letsPending = await UsersModel.findByIdAndUpdate(
          req.params.reciverId,
          { $push: { "social.pending": req.params.senderId } },
          { new: true, runValidators: true }
        );
        res.send({ letsSend, letsPending });
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post(
  "/:accepterId/acceptfriend/:acceptedId",
  async (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
