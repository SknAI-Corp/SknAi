// models/report.model.js
import mongoose, {Schema} from "mongoose";

const reportSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      unique: true // One report per session
    },
    images: [String], // Cloudinary image URLs
    userQuery: {
      type: String,
      required: true
    },
    aiGeneratedSummary: {
      type: String,
      required: true
    },
    doctorRemarks: {
      type: String
    },
    reportPdfUrl: {
        type: String
    },
    status: {
      type: String,
      enum: ["pending", "done"],
      default: "pending"
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor"
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
