import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Session } from "../models/session.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

// Create a new session (triggered by "New Chat")
const createSession = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (title && typeof title !== "string") {
    throw new ApiError(400, "Session title must be a string");
  }

  const session = await Session.create({
    userId: req.user._id,
    title: title?.trim() || "Untitled Chat"
  });

  return res
    .status(201)
    .json(new ApiResponse("Session created successfully", session, 201));
});

// Get all sessions for current user
const getUserSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ userId: req.user._id }).sort({
    updatedAt: -1
  });

  if (!sessions || sessions.length === 0) {
    throw new ApiError(404, "No sessions found for this user");
  }

  return res
    .status(200)
    .json(new ApiResponse("Sessions fetched successfully", sessions, 200));
});

// Get a specific session by ID
const getSessionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const session = await Session.findById(id);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to access this session");
  }

  return res
    .status(200)
    .json(new ApiResponse("Session fetched successfully", session, 200));
});

// Update an existing session (title, imageUrl, medicalHistory)
const updateSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    const session = await Session.findById(id);
    if (!session) {
      throw new ApiError(404, "Session not found");
    }
  
    //Authorization check
    if (session.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update this session");
    }
  
    const { title, medicalHistory } = req.body;
  
    //Handle text field updates
    if (title) session.title = title.trim();
    if (medicalHistory) session.medicalHistory = medicalHistory.trim();
  
    //Handle image upload if exists
    let uploadedImageUrl = null;
    const filePath = req.files?.imageUrl?.[0]?.path;
  
    if (filePath) {
      const cloudinaryUpload = await uploadOnCloudinary(filePath);
      if (!cloudinaryUpload?.url) {
        throw new ApiError(500, "Image upload failed");
      }
      session.imageUrl = cloudinaryUpload.url;
      uploadedImageUrl = cloudinaryUpload.url;
    }
  
    await session.save();
  
    return res.status(201).json(
      new ApiResponse("Session updated successfully", session, 201)
    );
});

export {
  createSession,
  getUserSessions,
  getSessionById,
  updateSession
};
