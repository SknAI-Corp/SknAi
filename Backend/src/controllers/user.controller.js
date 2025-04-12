import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const user = await User.findById(userId);
  
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
  
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(500, "Error generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
  
    if ([firstName, lastName, email, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
  
    const existingUser = await User.findOne({ email: email.toLowerCase() });
  
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }
  
    let profileImagePath = req.files?.profileImage?.[0]?.path;
    let uploadedProfileImage = null;
  
    if (profileImagePath) {
      uploadedProfileImage = await uploadOnCloudinary(profileImagePath);
    }
  
    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: role || "user",
      profileImage: uploadedProfileImage?.url || null
    });
  
    const sanitizedUser = await User.findById(newUser._id).select("-password -refreshToken");
  
    return res.status(201).json(
      new ApiResponse("User registered successfully", sanitizedUser, 201)
    );
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }
  
    const user = await User.findOne({ email: email.toLowerCase() });
  
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    const isValidPassword = await user.isPasswordCorrect(password);
    if (!isValidPassword) {
      throw new ApiError(401, "Invalid credentials");
    }
  
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
    const userInfo = await User.findById(user._id).select("-password -refreshToken");
  
    const options = {
      httpOnly: true,
      secure: true, // Use secure cookies (requires HTTPS in production)
      sameSite: "Strict"
    };
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse("User logged in successfully", { user: userInfo, accessToken, refreshToken }, 200));
});


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );
  
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict"
    };
  
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse("User logged out successfully", {}, 200));
});

  
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  
    if (!incomingRefreshToken) {
      throw new ApiError("Unauthorized - missing refresh token",{}, 401);
    }
  
    try {
      const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decoded?._id);
  
      if (!user || incomingRefreshToken !== user.refreshToken) {
        throw new ApiError("Invalid or expired refresh token",{},401);
      }
  
      const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
  
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
      };
  
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse("Access token refreshed", { accessToken, refreshToken: newRefreshToken }, 200));
    } catch (error) {
      throw new ApiError("Invalid refresh token",{}, 401);
    }
});

const changeCurrentPassword = asyncHandler(async(req, res) => {
  const {oldPassword, newPassword} = req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
      throw new ApiError("Invalid old password",{},400)
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new ApiResponse("Password changed successfully", {}, 200))
})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json(new ApiResponse("User fetched successfully", req.user, 200));
  });

const updateAccountDetails = asyncHandler(async(req, res) => {
  const {firstName, lastName, email} = req.body

  if (!firstName || !lastName || !email) {
      throw new ApiError( "All fields are required", {},  400)
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set: {
              firstName,
              lastName,
              email: email
          }
      },
      {new: true}
      
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse("Account details updated successfully", user, 200))
});

  
  export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails
  };