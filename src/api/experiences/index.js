import Express from "express";
import UsersModel from "../users/model.js";
import ExperiencesModel from "./model.js";
import createHttpError from "http-errors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "experiences/image" },
  }),
}).single("image");

const experienceRouter = Express.Router();

experienceRouter.post("/:userId/experiences", async (req, res, next) => {
  try {
    const experienceToAdd = new ExperiencesModel({
      ...req.body,
      image: "https://picsum.photos/200/300",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      { $push: { experiences: experienceToAdd } },
      { new: true, runValidator: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(
        createHttpError(
          404,
          `User witht the id: ${req.params.userId} not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

experienceRouter.get("/:userId/experiences", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user.experiences);
    } else {
      next(
        createHttpError(
          404,
          `User witht the id: ${req.params.userId} not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

experienceRouter.get(
  "/:userId/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        const experience = user.experiences.find(
          (e) => e._id.toString() === req.params.experienceId
        );
        if (experience) {
          res.send(experience);
        } else {
          next(
            createHttpError(
              404,
              `Experience witht the id: ${req.params.experienceId} not found.`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `User witht the id: ${req.params.userId} not found.`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

experienceRouter.put(
  "/:userId/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        const index = user.experiences.findIndex(
          (e) => e._id.toString() === req.params.experienceId
        );
        if (index !== -1) {
          console.log(`user.experiences[index]: ${user.experiences[index]}`);
          user.experiences[index] = {
            ...user.experiences[index].toObject(),
            ...req.body,
            updatedAt: new Date(),
          };
          console.log(user);
          await user.save();
          res.send(user);
        } else {
          next(
            createHttpError(
              404,
              `Experience with the id ${req.params.experienceId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `User with the id ${req.params.userId} not found!`
          )
        );
      }
    } catch (error) {
      console.log("The error name is:", error.name);
      if (error.name === "StrictModeError") {
        next(createHttpError(400, error.message));
      } else {
        next(error);
      }
    }
  }
);

experienceRouter.delete(
  "/:userId/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { $pull: { experiences: { _id: req.params.experienceId } } },
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(
          createHttpError(
            404,
            `User with the id ${req.params.userId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// ************************ IMAGE ************************

experienceRouter.post(
  "/:userId/experiences/:expId/image",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        const index = user.experiences.findIndex(
          (e) => e._id.toString() === req.params.expId
        );

        if (index === -1)
          return next(
            createHttpError(
              404,
              `Experience witht the id: ${req.params.expId} not found.`
            )
          );
        user.experiences[index] = {
          ...user.experiences[index].toObject(),
          image: req.file.path,
          updatedAt: new Date(),
        };
        await user.save();
        res.send(user);
      } else {
        next(createError(404, `User with id ${req.params.userId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default experienceRouter;
