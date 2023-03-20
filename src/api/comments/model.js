import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentsSchema = new Schema(
  {
    comment: { type: String, required: true },
    blog: [{ type: Schema.Types.ObjectId, ref: "Posts", required: true }],
  },
  { timestamps: true }
);

commentsSchema.static("findcommentsWithPosts", async function (query) {
  const comments = await this.find(query.criteria, query.options.fields)
    .limit(query.options.limit)
    .skip(query.options.skip)
    .sort(query.options.sort)
    .populate({ path: "Blogs", select: "post img" });
  const total = await this.countDocuments(query.criteria);
  return { comments, total };
});

export default model("Comment", commentsSchema);
