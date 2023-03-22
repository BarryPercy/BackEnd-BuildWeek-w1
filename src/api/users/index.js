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
        res.send({
          message: `Friend request cancelled to ${req.params.reciverId}`,
        });
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
        res.send({
          message: `Friend request sended to ${req.params.reciverId}`,
        });
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
      const accepter = await UsersModel.findById(req.params.accepterId);
      if (!accepter)
        return next(
          createHttpError(
            404,
            `User with the id: ${req.params.accepterId} not found.`
          )
        );
      const accepted = await UsersModel.findById(req.params.acceptedId);
      if (!accepted)
        return next(
          createHttpError(
            404,
            `User with the id: ${req.params.acceptedId} not found.`
          )
        );

      const isPending = await UsersModel.findOne({
        "social.pending": req.params.acceptedId,
      });

      if (isPending) {
        const letsAcceptFriend = await UsersModel.findByIdAndUpdate(
          req.params.accepterId,
          {
            $pull: { "social.pending": req.params.acceptedId },
            $push: { "social.friends": req.params.acceptedId },
          },
          { new: true, runValidators: true }
        );
        const letsBeAccepted = await UsersModel.findOneAndUpdate(
          req.params.acceptedId,
          {
            $pull: { "social.sent": req.params.accepterId },
            $push: { "social.friends": req.params.accepterId },
          },
          { new: true, runValidators: true }
        );

        res.send({
          message: `User ${req.params.acceptedId} accepted as friend`,
        });
      } else {
        createHttpError(
          404,
          `No pending request with the id: ${req.params.acceptedId} not found.`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post(
  "/:unfriendlyId/unfriend/:unfriendedId",
  async (req, res, next) => {
    try {
      const unFriendly = await UsersModel.findById(req.params.unfriendlyId);
      if (!unFriendly)
        return next(
          createHttpError(
            404,
            `User with the id: ${req.params.unfriendlyId} not found.`
          )
        );
      const unFriended = await UsersModel.findById(req.params.unfriendedId);
      if (!unFriended)
        return next(
          createHttpError(
            404,
            `User with the id: ${req.params.unfriendedId} not found.`
          )
        );

      const areTheyFriends = await UsersModel.findOne({
        "social.friends": req.params.unfriendedId,
      });
      if (areTheyFriends._id.toString() === req.params.unfriendlyId) {
        const letsUnFriendFirst = await UsersModel.findOneAndUpdate(
          req.params.unfriendlyId,
          { $push: { "social.friends": req.params.unfriendedId } },
          { new: true, runValidators: true }
        );
        const letsUnFriendSecond = await UsersModel.findOneAndUpdate(
          req.params.unfriendedId,
          { $push: { "social.friends": req.params.unfriendlyId } },
          { new: true, runValidators: true }
        );
        res.send({
          message: `You and User with the id: ${req.params.unfriendedId} are not friends any more`,
        });
      } else {
        createHttpError(
          404,
          `User with the id: ${req.params.unfriendlyId} and User with the id:${req.params.unfriendedId}are not friends`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
