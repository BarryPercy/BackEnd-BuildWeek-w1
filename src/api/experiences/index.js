import Express from "express";
import UsersModel from "../users/model.js";
import ExperiencesModel from "./model.js";
import createHttpError from "http-errors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import util from "util";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "experiences/image" },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      const error = new Error("Only JPEG and PNG files are allowed!");
      error.status = 400; // HTTP status code for Bad Request
      return cb(error, false);
    }
    cb(null, true);
  },
}).single("image");

const experienceRouter = Express.Router();

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

// ************************ CSV ************************

experienceRouter.get("/:userId/experiences/CSV", async (req, res, next) => {
  try {
    const readFile = util.promisify(fs.readFile);
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=experiences.csv"
    );
    const user = await UsersModel.findById(req.params.userId);
    if (!user)
      return next(
        createError(404, `User with id ${req.params.userId} not found!`)
      );
    const expArr = user.experiences;
    const csvWriter = createObjectCsvWriter({
      path: "output.csv",
      header: [
        { id: "userId", title: "userId" },
        { id: "experienceId", title: "experienceId" },
        { id: "role", title: "Role" },
        { id: "company", title: "Company" },
        { id: "description", title: "Description" },
        { id: "area", title: "Area" },
      ],
    });
    const rows = expArr.map((e) => ({
      userId: user._id,
      experienceId: e._id,
      role: e.role,
      company: e.company,
      description: e.description,
      area: e.area,
    }));
    console.log("CSV file created successfully!");
    await csvWriter.writeRecords(rows);
    const csvFile = await readFile("output.csv", "utf-8");
    res.send(csvFile);
  } catch (error) {
    next(error);
  }
});

experienceRouter.post("/:userId/experiences", async (req, res, next) => {
  try {
    console.log("body->", req.body);
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
      res.send(experienceToAdd);
    } else {
      next(
        createHttpError(
          404,
          `User with the id: ${req.params.userId} not found.`
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

export default experienceRouter;
