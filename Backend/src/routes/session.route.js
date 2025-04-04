import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    // createSession,
    getUserSessions,
    getSessionById,
    updateSession
  } from "../controllers/session.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// router.route("/").post(verifyJWT, createSession)
router.route("/").get(verifyJWT, getUserSessions)
router.route("/:id").get(verifyJWT, getSessionById)
router
  .route("/:id")
  .patch(
    verifyJWT,
    upload.fields([{ name: "imageUrl", maxCount: 1 }]),
    updateSession
  );

export default router;