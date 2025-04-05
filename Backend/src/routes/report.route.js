// routes/report.routes.js
import express from "express";
import { verifyWithDermatologist } from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/verify").post(
  verifyJWT,
  upload.fields([{ name: "images", maxCount: 3 }]),
  verifyWithDermatologist
);

export default router;