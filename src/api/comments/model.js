import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentsSchema = new Schema(
  {
    comment: { type: String, required: true },
    user: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  },
  { timestamps: true }
);

export default model("Comments", commentsSchema);
