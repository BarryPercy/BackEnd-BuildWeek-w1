import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postsSchema = new Schema(
  {
    text: { type: String, required: true },
    image: { type: String },
    user: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
  },
  { timestamps: true }
);

postsSchema.static("findpostsWithUsers", async function (query) {
  const posts = await this.find(query.criteria, query.options.fields)
    .limit(query.options.limit)
    .skip(query.options.skip)
    .sort(query.options.sort)
    .populate({
      path: "user comments",
      select: "name surname comment",
    });
  const total = await this.countDocuments(query.criteria);
  return { posts, total };
});

export default model("Posts", postsSchema);
