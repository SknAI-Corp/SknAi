import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { sendMessage, getMessagesBySession } from "../controllers/message.controller.js";

const router = express.Router();

router
  .route("/")
  .post(
    verifyJWT,
    upload.fields([{ name: "imageAttached", maxCount: 1 }]),
    sendMessage
  );

router
  .route("/")
  .get(
    verifyJWT,
    getMessagesBySession
  );

export default router