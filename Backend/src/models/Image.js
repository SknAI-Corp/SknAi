import mongoose from "mongoose";
const imageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
}, { timestamps: true });
export default mongoose.model("image_model", imageSchema);