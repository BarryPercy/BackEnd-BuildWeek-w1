import Express from "express";
import UsersModel from "../users/model.js";
import ExperiencesModel from "./model.js";
import createHttpError from "http-errors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import util from "util";
import { Transform } from "@json2csv/node";
import { pipeline } from "stream";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "experiences/image" },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|legfilljpeg|png)$/)) {
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
              `Experience with the id: ${req.params.expId} not found.`
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

// experienceRouter.get("/:userId/experiences/CSV", async (req, res, next) => {
//   try {
//     const user = await UsersModel.findById(req.params.userId);
//     if (!user)
//       return next(
//         createError(404, `User with id ${req.params.userId} not found!`)
//       );
//     const expArr = user.experiences;
//     const filename = `${(
//       user.name
//     ).toLowerCase()}-experiences.csv`;
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=${filename}.csv`
//     );
//     const src = JSON.stringify(expArr);
//     const transform = new Transform({
//       fields: [ "role", "company", "description", "area"],
//     });
//     pipeline(src, transform, res, (error) => {
//       if (error) console.log(error);
//     });
//   } catch (error) {
//     next(error);
//   }
// });

experienceRouter.post("/:userId/experiences", async (req, res, next) => {
  try {
    const user = await UsersModel.findByPk(req.params.userId);
    if(user){
      const experienceToAdd = await ExperiencesModel.create({
        ...req.body,
        image: "https://picsum.photos/200/300",
        userId:req.params.userId
      });
      res.send(experienceToAdd);
    } else {
      next(
        createHttpError(404, `User with the id: ${req.params.userId} not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

experienceRouter.get("/:userId/experiences", async (req, res, next) => {
  try {
    const user = await UsersModel.findByPk(req.params.userId);
    if (user) {
      const experiences = await ExperiencesModel.findAll({where:{userId:req.params.userId}})
      res.send(experiences);
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
      const user = await UsersModel.findByPk(req.params.userId);
      if (user) {
        const experience = await ExperiencesModel.findByPk(req.params.experienceId)
        if(experience){
          res.send(experience);
        }else{
          next(
            createHttpError(
              404,
              `Experience with the id: ${req.params.experienceId} not found.`
            )
          );
        } 
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
  }
);

experienceRouter.put(
  "/:userId/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findByPk(req.params.userId);
      if (user) {
        const [numberOfUpdatedRows, updatedRecords] = await ExperiencesModel.update(req.body, { where: { experienceId: req.params.experienceId }, returning: true })
        if (numberOfUpdatedRows === 1) {
          res.send(updatedRecords[0])
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
      const user = await UsersModel.findByPk(req.params.userId);
      if (user) {
        const numberOfDeletedRows = await ExperiencesModel.destroy({ where: { experienceId: req.params.experienceId } })
        if (numberOfDeletedRows === 1) {
          res.status(204).send()
        } else {
          next(createError(404, `Post with id ${req.params.id} not found!`));
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
      next(error);
    }
  }
);

export default experienceRouter;
