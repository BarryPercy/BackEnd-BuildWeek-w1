import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import UsersModel from "./model.js";
import { v2 as cloudinary } from "cloudinary";
import PDFDocument from "pdfkit";

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

// ************************ CV PDF ************************

usersRouter.get("/:userId/CV", async (req, res, next) => {
  try {
    const document = await UsersModel.findById(req.params.userId);
    if (!document)
      return next(
        createError(404, `User with id ${req.params.userId} not found!`)
      );
    const doc = new PDFDocument();
    doc.text(`Name: ${document.name}`);
    doc.text(`Surname: ${document.surname}`);
    doc.text(`Email: ${document.email}`);
    doc.text(`Bio: ${document.bio}`);
    doc.text(`Title: ${document.title}`);
    doc.text(`Area: ${document.area}`);
    document.experiences.map((e) => doc.text(`Experience: ${e}`));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Conten-Disposition", `attachment; filename=${document._id}`);
    doc.pipe(res);
    doc.end();
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
