import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Session } from "../models/session.model.js";
import { Message } from "../models/message.model.js";
import { Report } from "../models/report.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { callQnAAPI } from "../utils/externalApi.js";
import { generateAndUploadPDF } from "../utils/pdfUploader.js";
import { User } from "../models/user.model.js";

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

  const filePaths = req.files?.images?.map(file => file.path) || [];
  const uploadedImages = [];

  // Upload images to Cloudinary
  for (const path of filePaths) {
    const uploaded = await uploadOnCloudinary(path);
    if (uploaded?.url) uploadedImages.push(uploaded.url);
  }

  // Generate LLM-based AI summary
  const aiResponse = await callQnAAPI({
    user_message: userQuery,
    session_id: sessionId
  });

  if (!aiResponse?.response) {
    throw new ApiError(500, "Failed to generate LLM summary");
  }

  // Create report in DB
  const report = await Report.create({
    userId: req.user._id,
    sessionId,
    images: uploadedImages,
    userQuery,
    aiGeneratedSummary: aiResponse.response
  });

  // Generate PDF and upload to Cloudinary
  const user = await User.findById(req.user._id);
  const pdfUrl = await generateAndUploadPDF({
    userName: user.firstName,
    userEmail: user.email,
    aiReportText: aiResponse.response,
    imageUrls: uploadedImages,
    sessionId
  });

  // Save PDF URL to report
  report.reportPdfUrl = pdfUrl;
  await report.save();

  return res.status(201).json(
    new ApiResponse("Report submitted to dermatologist", report, 201)
  );
});

// GET /api/v1/reports?userId=xyz
const getReports = asyncHandler(async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const reports = await Report.find({ userId }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse("Reports fetched successfully", reports, 200)
  );
});

export {
  verifyWithDermatologist,
  getReports
};
