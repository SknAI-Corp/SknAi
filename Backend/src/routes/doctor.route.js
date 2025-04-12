import express from "express";
import { registerDoctor, loginDoctor, logoutDoctor, getDoctorProfile, getAllDoctors } from "../controllers/doctor.controller.js";
import { verifyDoctor } from "../middlewares/verifyDoctor.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getAssignedReports, submitDoctorRemarks } from "../controllers/doctorReport.controller.js";

const router = express.Router();

// Auth
router.post("/register", upload.single("profileImage"), registerDoctor);
router.post("/login", loginDoctor);
router.post("/logout", verifyDoctor, logoutDoctor);
router.get("/me", verifyDoctor, getDoctorProfile);
router.get("/all-doctors", getAllDoctors)

// Reports
router.get("/reports", verifyDoctor, getAssignedReports);
router.patch("/reports/:id/review", verifyDoctor, submitDoctorRemarks);

export default router;
