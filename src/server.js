import Express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import postsRouter from "./api/posts/index.js";
import usersRouter from "./api/users/index.js";
import commentsRouter from "./api/comments/index.js";
import {
  badReqHandler,
  generalErrorHandler,
  notFoundHandler,
} from "./errorHandlers.js";
import experienceRouter from "./api/experiences/index.js";

const server = Express();
const port = process.env.PORT || 3001;
const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
const corsOptions = {
  origin: (origin, corsNext) => {
    if (!origin || whiteList.indexOf(origin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(
        corsNext(
          createHttpError(400, `Origin ${origin} is not in the whitelist!`)
        )
      );
    }
  },
};
server.use(cors(corsOptions));

// server.use(cors());
server.use(Express.json());

server.use("/users", usersRouter);
server.use("/posts", postsRouter);
server.use("/users", experienceRouter);
// server.use("/users/", educationRouter);
server.use("/posts", commentsRouter);
// server.use("/users", imageRouter);
// server.use("/profile", CVRouter);
// server.use("/users", CSVRouter);

// ************************* ERROR HANDLERS *******************

server.use(badReqHandler);
server.use(notFoundHandler);
server.use(generalErrorHandler);

mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on("connected", () => {
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port ${port}`);
  });
});
