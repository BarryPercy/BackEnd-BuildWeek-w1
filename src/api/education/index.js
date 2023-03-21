import Express from "express";
import UsersModel from "../users/model.js";
import EducationsModel from "./model.js";
import createHttpError from "http-errors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "education/image" },
  }),
}).single("image");

const educationRouter = Express.Router();

educationRouter.post("/:userId/educations", async (req, res, next) => {
  try {
    const educationToAdd = new EducationsModel({
      ...req.body,
      image: "https://picsum.photos/200/300",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      { $push: { educations: educationToAdd } },
      { new: true, runValidator: true }
    );
    if (updatedUser) {
      res.send(educationToAdd);
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

educationRouter.get("/:userId/educations", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user.educations);
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

educationRouter.get(
  "/:userId/educations/:educationId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        const education = user.educations.find(
          (e) => e._id.toString() === req.params.educationId
        );
        if (education) {
          res.send(education);
        } else {
          next(
            createHttpError(
              404,
              `Education witht the id: ${req.params.educationId} not found.`
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

educationRouter.put(
  "/:userId/educations/:educationId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        const index = user.educations.findIndex(
          (e) => e._id.toString() === req.params.educationId
        );
        if (index !== -1) {
          user.educations[index] = {
            ...user.educations[index].toObject(),
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
              `Education with the id ${req.params.educationId} not found!`
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

educationRouter.delete(
  "/:userId/educations/:educationId",
  async (req, res, next) => {
    try {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { $pull: { educations: { _id: req.params.educationId } } },
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

educationRouter.post(
  "/:userId/educations/:educationId/image",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      if (user) {
        const index = user.educations.findIndex(
          (e) => e._id.toString() === req.params.educationId
        );

        if (index === -1)
          return next(
            createHttpError(
              404,
              `Education witht the id: ${req.params.educationId} not found.`
            )
          );
        user.educations[index] = {
          ...user.educations[index].toObject(),
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

export default educationRouter;
