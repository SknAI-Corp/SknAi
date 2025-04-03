// import { Client } from "@gradio/client";
// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import cors from "cors";

// const app = express();
// const port = 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Setup multer for file uploads
// const upload = multer({ dest: "uploads/" });

// // Hugging Face API Endpoint
// const HF_API_URL = "https://Team-SknAI-Demo-v4.hf.space"; // Update with your actual API URL

// // Handle image upload and prediction
// app.post("/predict", upload.single("image"), async (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded" });
//     }
    
//     try {
//         const imageData = fs.readFileSync(req.file.path);
        
//         const client = await Client.connect(HF_API_URL);
//         const result = await client.predict("/predict", { 
//             image: imageData, 
//         });
        
//         // Remove the uploaded image after processing
//         fs.unlinkSync(req.file.path);
        
//         res.json({ prediction: result.data });
//     } catch (error) {
//         res.status(500).json({ error: "Error processing image" });
//     }
// });

// app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
// });



// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const multer = require("multer");
// const cors = require("cors");
// const fs = require("fs");
// import express from "express";
// import mongoose from "mongoose";
// import jwt from "jsonwebtoken";
// import cors from "cors";
// import dotenv from "dotenv";
// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));

//   // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });


// // User Schema
// const userSchema = new mongoose.Schema({
//   firstName: String,
//   lastName: String,
//   email: String,
//   password: String, 
// });


// const User = mongoose.model("User", userSchema);

// // Define Image Schema
// const imageSchema = new mongoose.Schema({
//   imageUrl: { type: String, required: true },
// }, { timestamps: true });

// const ImageModel = mongoose.model("Image_model", imageSchema);

// // Generate JWT Token
// const generateToken = (user) => {
//   return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
// };
// // Multer setup (store file in memory)
// const storage = multer.memoryStorage(); // Store file in memory
// const upload = multer({ storage: storage });
// // API to upload image
// app.post("/upload", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const uploadStream = cloudinary.uploader.upload_stream(
//       { resource_type: "image" },
//       async (error, cloudinaryResult) => {
//         if (error) {
//           return res.status(500).json({ error: error.message });
//         }

//         try {
//           // Save Image URL in MongoDB
//           const newImage = new ImageModel({ imageUrl: cloudinaryResult.secure_url });
//           await newImage.save();

//           res.json({
//             message: "Image uploaded successfully!",
//             imageUrl: cloudinaryResult.secure_url,
//           });
//         } catch (dbError) {
//           res.status(500).json({ error: "Failed to save image in database" });
//         }
//       }
//     );

//     streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
// // Signup Route
// app.post("/signup", async (req, res) => {
//   try {
//     const { firstName, lastName, email, password } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ error: "Email already in use" });

//     const newUser = new User({ firstName, lastName, email, password });
//     await newUser.save();

//     // const token = generateToken(newUser);

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Signin Route
// app.post("/signin", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) return res.status(400).json({ error: "All fields are required" });

//     const user = await User.findOne({ email });
//     if (!user || user.password !== password) return res.status(400).json({ error: "Invalid credentials" });

//     // Ensure JWT_SECRET is defined
//     if (!process.env.JWT_SECRET) {
//       return res.status(500).json({ error: "Server configuration error: JWT secret missing" });
//     }

//     // Generate token
//     const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     console.error("Signin Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// // Middleware to Verify JWT Token
// const authenticateToken = (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header
//   if (!token) {
//     return res.status(403).json({ message: "No token provided" });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: "Invalid token" });
//     }
//     req.user = user; // Add user to request object
//     next();
//   });
// };

// // Endpoint to get user details
// app.get("/user", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id; // Assuming the JWT contains the user's ID

//     // Fetch user details from the database (adjust the model as per your DB schema)
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Return user data (modify to return the necessary data, e.g., firstName)
//     res.json({
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       // Add other fields as necessary
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });








// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./src/routes/user.route.js";
import imageRoutes from "./src/routes/imageRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});