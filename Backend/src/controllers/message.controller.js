import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Message } from "../models/message.model.js";
import { Session } from "../models/session.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { callClassifierAPI, callQnAAPI } from "../utils/externalApi.js";

// POST /api/v1/messages
// const sendMessage = asyncHandler(async (req, res) => {
//   const { sessionId } = req.body;
//   const userMessage = req.body.content;

//   // if (!sessionId || !userMessage) {
//   //   throw new ApiError(400, "sessionId and content are required");
//   // }

//   if (!sessionId) {
//        throw new ApiError(400, "sessionId are required");
//     }

//   // 1. Validate session
//   const session = await Session.findById(sessionId);
//   if (!session) throw new ApiError(404, "Session not found");

//   if (session.userId.toString() !== req.user._id.toString()) {
//     throw new ApiError(403, "Unauthorized access to session");
//   }

//   // 2. Upload image if present
//   let imageUrl = null;
//   const filePath = req.files?.imageAttached?.[0]?.path;

//   if (filePath) {
//     const cloudinaryResult = await uploadOnCloudinary(filePath);
//     if (!cloudinaryResult?.url) throw new ApiError(500, "Image upload failed");
//     imageUrl = cloudinaryResult.url;
//   }

//   // 3. Save user message to MongoDB
//   const userMsg = await Message.create({
//     sessionId,
//     sender: "user",
//     content: userMessage,
//     imageAttached: imageUrl
//   });

//   // 4. If image present → classify
//   let predictedDisease = null;
//   if (imageUrl) {
//     predictedDisease = await callClassifierAPI(imageUrl);
//   }

//   // 5. Call Langchain QnA FastAPI
//   const aiReply = await callQnAAPI({
//     user_message: userMessage,
//     predicted_disease: predictedDisease,
//     session_id: sessionId
//   });

//   if (!aiReply?.response) {
//     throw new ApiError(500, "AI did not return a response");
//   }

//   // 6. Save AI response to MongoDB
//   const aiMsg = await Message.create({
//     sessionId,
//     sender: "ai",
//     content: aiReply.response
//   });

//   // 7. Return both messages
//   return res.status(201).json(
//     new ApiResponse("Message and response saved successfully", {
//       userMessage: userMsg,
//       aiMessage: aiMsg
//     }, 201)
//   );
// });


//For Solving Empty Session Problem:
const sendMessage = asyncHandler(async (req, res) => {
  let { sessionId } = req.body;
  const userMessage = req.body.content;

  if (!userMessage) {
    throw new ApiError(400, "Message content is required");
  }

  let session;

  // 🧠 If no sessionId passed → create new session
  if (!sessionId) {
    session = await Session.create({
      userId: req.user._id,
      title: "Untitled Chat"
    });
    sessionId = session._id;
  } else {
    session = await Session.findById(sessionId);
    if (!session) throw new ApiError(404, "Session not found");

    if (session.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized access to session");
    }
  }

  // 📦 Upload image if present
  let imageUrl = null;
  const filePath = req.files?.imageAttached?.[0]?.path;
  if (filePath) {
    const cloudinaryResult = await uploadOnCloudinary(filePath);
    if (!cloudinaryResult?.url) throw new ApiError(500, "Image upload failed");
    imageUrl = cloudinaryResult.url;
  }

  // 💬 Save user message
  const userMsg = await Message.create({
    sessionId,
    sender: "user",
    content: userMessage,
    imageAttached: imageUrl,
    userId: req.user._id
  });

  // 🧠 Predict disease (optional)
  let predictedDisease = null;
  if (imageUrl) {
    predictedDisease = await callClassifierAPI(imageUrl);
  }
  console.log(predictedDisease)

  // 🤖 Call Langchain QnA
  const aiReply = await callQnAAPI({
    user_message: userMessage,
    predicted_disease: predictedDisease,
    session_id: sessionId
  });

  if (!aiReply?.response) {
    throw new ApiError(500, "AI did not return a response");
  }

  const aiMsg = await Message.create({
    sessionId,
    sender: "ai",
    content: aiReply.response,
    userId: req.user._id
  });

  // 📝 Auto-update session title only if it's still "Untitled Chat"
  const existingMessages = await Message.countDocuments({ sessionId });

  if (existingMessages <= 2 && session.title === "Untitled Chat") {
    session.title = aiReply.response.slice(0, 20).replace(/\n/g, " ");
    session.updatedAt = new Date();
    await session.save();
  }


  return res.status(201).json(
    new ApiResponse("Message and response saved", {
      sessionId: session._id,
      sessionTitle: session.title,
      userMessage: userMsg,
      aiMessage: aiMsg
    }, 201)
  );
});

// GET /api/v1/messages?sessionId=...
const getMessagesBySession = asyncHandler(async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) throw new ApiError(400, "sessionId is required");

  const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });

  return res
    .status(200)
    .json(new ApiResponse("Messages fetched successfully", messages, 200));
});

export {
  sendMessage,
  getMessagesBySession
};
