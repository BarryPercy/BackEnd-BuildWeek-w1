import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import UsersModel from "./model.js";
import { v2 as cloudinary } from "cloudinary";
import PDFDocument from "pdfkit";
import request from "request";

const usersRouter = Express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "users/image" },
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

usersRouter.post("/", async (req, res, next) => {
  try {
    const userToAdd = {
      ...req.body,
      image:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      experiences: [],
      cover:
        "https://ns.clubmed.com/dream/PRODUCT_CENTER/DESTINATIONS/SUN/Caraibes___Amerique_du_Nord/Turks___Caicos/Turkoise/61477-utr4qogyd6-swhr.jpg",
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
    const users = await UsersModel.find().populate({
      path: "social.friends social.sent social.pending",
      select: "name surname image",
    });
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId).populate({
      path: "social.friends social.sent social.pending",
      select: "name surname image",
    });
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

// ************************ COVER PICTURE ************************

usersRouter.post(
  "/:userId/cover",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { cover: req.file.path },
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

    request(
      { url: document.image, encoding: null },
      function (err, response, body) {
        if (err) {
          console.error(err);
          return;
        }

        // Create a buffer from the image data
        const imageBuffer = Buffer.from(body);

        // Create an image object from the buffer
        const image = doc.openImage(imageBuffer);

        // Add the image to the PDF document
        doc.image(image, {
          fit: [120, 120], // Width and height of the image in pixels
          align: "center",
          valign: "center",
        });
        doc.text(` `);
        doc.text(`Name: ${document.name}`);
        doc.text(`Surname: ${document.surname}`);
        doc.text(`Email: ${document.email}`);
        doc.text(`Bio: ${document.bio}`);
        doc.text(`Title: ${document.title}`);
        doc.text(`Area: ${document.area}`);
        doc.text(` `);
        if (document.experiences.length > 0) {
          doc.text(`Experiences:`);
          document.experiences.map((e) => {
            doc.text(`    role: ${e.role}`),
              doc.text(`    company: ${e.company}`),
              doc.text(`    Description: ${e.description}`);
            doc.text(`    Area: ${e.area}`);
            doc.text(`    Start Date: ${e.startDate}`);
            if (e.endDate) doc.text(`    End Date: ${e.endDate}`);
            doc.text(` `);
          });
        }
        if (document.educations.length > 0) {
          doc.text(`Educations:`);
          document.educations.map((e) => {
            doc.text(`    School: ${e.school}`);
            if (e.degree) doc.text(`    Degree: ${e.degree}`);
            if (e.field) doc.text(`    Field: ${e.field}`);
            if (e.grade) doc.text(`   Grade: ${e.grade}`);
            if (e.activity) doc.text(`    Activity: ${e.activity}`);
            if (e.startDate) doc.text(`    Start Date: ${e.startDate}`);
            if (e.endDate) doc.text(`    End Date: ${e.endDate}`);
            doc.text(` `);
          });
        }
        // Set the PDF response headers and send the PDF document to the client
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${document._id}`
        );
        doc.pipe(res);
        doc.end();
      }
    );
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

      const isSent = sender.social.sent.includes(req.params.reciverId);
      const isFriend = sender.social.friends.includes(req.params.reciverId);
      const isPending = sender.social.pending.includes(req.params.reciverId);

      if (isSent) {
        const letsUnSend = await UsersModel.findOneAndUpdate(
          { _id: req.params.senderId },
          { $pull: { "social.sent": req.params.reciverId } },
          { new: true, runValidators: true }
        );
        const letsUnPending = await UsersModel.findByIdAndUpdate(
          { _id: req.params.reciverId },
          { $pull: { "social.pending": req.params.senderId } },
          { new: true, runValidators: true }
        );
        res.send({
          message: `Friend request cancelled to ${req.params.reciverId}`,
        });
      } else if (isFriend) {
        res.send({
          message: `Id: ${req.params.senderId} is already your friend.`,
        });
      } else if (isPending) {
        res.send({
          message: `You have a pending request from id: ${req.params.senderId}, accept it to be friends`,
        });
      } else {
        const letsSend = await UsersModel.findOneAndUpdate(
          { _id: req.params.senderId },
          { $push: { "social.sent": req.params.reciverId } },
          { new: true, runValidators: true }
        );
        const letsPending = await UsersModel.findByIdAndUpdate(
          { _id: req.params.reciverId },
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

      const isPending = accepter.social.pending.includes(req.params.acceptedId);

      if (isPending) {
        const letsAcceptFriend = await UsersModel.findByIdAndUpdate(
          { _id: req.params.accepterId },
          {
            $pull: { "social.pending": req.params.acceptedId },
            $push: { "social.friends": req.params.acceptedId },
          },
          { new: true, runValidators: true }
        );
        const letsBeAccepted = await UsersModel.findOneAndUpdate(
          { _id: req.params.acceptedId },
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
        return next(
          createHttpError(
            404,
            `No pending request with the id: ${req.params.acceptedId} not found.`
          )
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

      const letsCheck = unFriendly.social.friends.includes(
        req.params.unfriendedId
      );

      if (letsCheck) {
        const letsUnFriendFirst = await UsersModel.findOneAndUpdate(
          { _id: req.params.unfriendlyId },
          { $pull: { "social.friends": req.params.unfriendedId } },
          { new: true, runValidators: true }
        );
        const letsUnFriendSecond = await UsersModel.findOneAndUpdate(
          { _id: req.params.unfriendedId },
          { $pull: { "social.friends": req.params.unfriendlyId } },
          { new: true, runValidators: true }
        );
        res.send({
          message: `You and User with the id: ${req.params.unfriendedId} are not friends any more`,
        });
      } else {
        return next(
          createHttpError(
            404,
            `User with the id: ${req.params.unfriendlyId} and User with the id:${req.params.unfriendedId}are not friends`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
