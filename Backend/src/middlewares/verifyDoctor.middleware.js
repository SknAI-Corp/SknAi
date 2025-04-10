import jwt from "jsonwebtoken";
import { Doctor } from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyDoctor = async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new ApiError(401, "Unauthorized");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const doctor = await Doctor.findById(decoded.doctorId).select("-password -refreshToken");

    if (!doctor) throw new ApiError(401, "Invalid doctor token");

    req.doctor = doctor;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
};
