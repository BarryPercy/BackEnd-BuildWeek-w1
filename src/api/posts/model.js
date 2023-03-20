import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postsSchema = new Schema(
  {
    post: { type: String, required: true },
    img: { type: String },
    user: { type: String },
    // user: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
  },
  { timestamps: true }
);

postsSchema.static("findpostsWithUsers", async function (query) {
  const posts = await this.find(query.criteria, query.options.fields)
    .limit(query.options.limit)
    .skip(query.options.skip)
    .sort(query.options.sort);
  // .populate({ path: "Users", select: "firstName lastName" });
  const total = await this.countDocuments(query.criteria);
  return { posts, total };
});

export default model("Post", postsSchema);
