import Express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import usersRouter from "./api/users/index.js";
import {
  badReqHandler,
  generalErrorHandler,
  notFoundHandler,
} from "./errorHandlers.js";
import { pgConnect } from "./db.js"
// import experienceRouter from "./api/experiences/index.js";
// import createHttpError from "http-errors";
// import educationRouter from "./api/education/index.js";
// import commentsRouter from "./api/comments/index.js";
import postsRouter from "./api/posts/index.js";

const server = Express();
const port = process.env.PORT || 3001;
server.use(cors())

server.use(Express.json());

server.use("/api/users", usersRouter);
server.use("/api/posts", postsRouter);
// server.use("/api/users", experienceRouter);
// server.use("/api/users", educationRouter);
// server.use("/api/posts", commentsRouter);
// server.use("/users", imageRouter);
// server.use("/profile", CVRouter);
// server.use("/users", CSVRouter);

// ************************* ERROR HANDLERS *******************

server.use(badReqHandler);
server.use(notFoundHandler);
server.use(generalErrorHandler);

await pgConnect()
server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log(`Server is running on port ${port}`)
})
