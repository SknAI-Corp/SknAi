import { Doctor } from "../models/doctor.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const registerDoctor = async (req, res) => {
  const { name, email, password, specialty } = req.body;

  if (!name || !email || !password) throw new ApiError(400, "All fields required");

  const exists = await Doctor.findOne({ email });
  if (exists) throw new ApiError(409, "Email already in use");

  let profileImage = null;
  if (req.file?.path) {
    const upload = await uploadOnCloudinary(req.file.path);
    profileImage = upload?.url || null;
  }

  const doctor = await Doctor.create({ name, email, password, specialty, profileImage });

  const accessToken = doctor.generateAccessToken();
  const refreshToken = doctor.generateRefreshToken();

  doctor.refreshToken = refreshToken;
  await doctor.save();

  res
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "Strict" })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" })
    .status(201)
    .json(new ApiResponse("Doctor registered", { doctor, accessToken }, 201));
};

const loginDoctor = async (req, res) => {
  const { email, password } = req.body;
  const doctor = await Doctor.findOne({ email });

  if (!doctor) throw new ApiError(404, "Doctor not found");

  const valid = await doctor.isPasswordCorrect(password);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const accessToken = doctor.generateAccessToken();
  const refreshToken = doctor.generateRefreshToken();

  doctor.refreshToken = refreshToken;
  await doctor.save();

  res
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "Strict" })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" })
    .status(200)
    .json(new ApiResponse("Doctor logged in", { doctor, accessToken }, 200));
};

const logoutDoctor = async (req, res) => {
  await Doctor.findByIdAndUpdate(req.doctor._id, { $unset: { refreshToken: 1 } });
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new ApiResponse("Doctor logged out", {}, 200));
};

const getDoctorProfile = async (req, res) => {
  res.status(200).json(new ApiResponse("Doctor profile", req.doctor, 200));
};

const getAllDoctors = async (req, res) => {
  const doctors = await Doctor.find().select("-password -refreshToken"); // hide sensitive fields

  res.status(200).json(new ApiResponse("All doctors fetched", doctors, 200));
};

export { registerDoctor, loginDoctor, logoutDoctor, getDoctorProfile, getAllDoctors };
