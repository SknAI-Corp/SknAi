// controllers/report.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Session } from "../models/session.model.js";
import { Message } from "../models/message.model.js";
import { Report } from "../models/report.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { callQnAAPI } from "../utils/externalApi.js";

// POST /api/v1/reports/verify
const verifyWithDermatologist = asyncHandler(async (req, res) => {
  const { sessionId, userQuery } = req.body;

  if (!sessionId || !userQuery) {
    throw new ApiError(400, "sessionId and userQuery are required");
  }

  const session = await Session.findById(sessionId);
  if (!session || session.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized or invalid session");
  }

  const existingReport = await Report.findOne({ sessionId });
  if (existingReport) {
    throw new ApiError(409, "Report already submitted for this session");
  }

  // Check session has at least one image + one AI message
  const messages = await Message.find({ sessionId });
  const hasImage = messages.some(msg => msg.imageAttached);
  const hasAIResponse = messages.some(msg => msg.sender === "ai");

  if (!hasImage || !hasAIResponse) {
    throw new ApiError(400, "Session must contain at least one image and one AI message");
  }

  // Upload any new images
  const filePaths = req.files?.images?.map(file => file.path) || [];
  const uploadedImages = [];

  for (const path of filePaths) {
    const uploaded = await uploadOnCloudinary(path);
    if (uploaded?.url) uploadedImages.push(uploaded.url);
  }

  // Call LLM to generate draft report
  const aiResponse = await callQnAAPI({
    user_message: userQuery,
    session_id: sessionId
  });

  if (!aiResponse?.response) {
    throw new ApiError(500, "Failed to generate LLM summary");
  }

  const report = await Report.create({
    userId: req.user._id,
    sessionId,
    images: uploadedImages,
    userQuery,
    aiGeneratedSummary: aiResponse.response
  });

  return res.status(201).json(
    new ApiResponse("Report submitted to dermatologist", report, 201)
  );
});

export { verifyWithDermatologist };
