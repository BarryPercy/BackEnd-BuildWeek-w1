import Express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import postsRouter from "./api/comments/model.js";

const server = Express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(Express.json());

// server.use("/users", usersRouter);
server.use("/posts", postsRouter);
// server.use("/users/", experienceRouter);
// server.use("/users/", educationRouter);
// server.use("/comments", commentsRouter);
// server.use("/users", imageRouter);
// server.use("/profile", CVRouter);
// server.use("/users", CSVRouter);

mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on("connected", () => {
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port ${port}`);
  });
});
