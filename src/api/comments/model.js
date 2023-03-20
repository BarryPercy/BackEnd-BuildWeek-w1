import express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";

const postsRouter = express.Router();

postsRouter.get("/", (req, res, next) => {});
postsRouter.get("/:id", (req, res, next) => {});
postsRouter.post("/", (req, res, next) => {});
postsRouter.put("/id", (req, res, next) => {});
postsRouter.delete("/:id", (req, res, next) => {});

export default postsRouter;
