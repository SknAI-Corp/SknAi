import express from "express";
import { manuallyAssignReports } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/assign-reports", manuallyAssignReports);

export default router;
