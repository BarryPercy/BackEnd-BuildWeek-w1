import mongoose from "mongoose";

const { Schema, model } = mongoose;

const educationsSchema = new Schema({
  school: { type: String, required: true },
  degree: { type: String },
  field: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  grade: { type: String },
  activity: { type: String },
  image: { type: String },
  description: { type: String },
  createdAt: { type: Date},
  updatedAt: { type: Date},
});

export default model("Education", educationsSchema);
