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



require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Define Image Schema
const ImageSchema = new mongoose.Schema({
  image: { type: Buffer, required: true },
  contentType: { type: String, required: true },
});

const ImageModel = mongoose.model("Image", ImageSchema);

// Set up Multer storage
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({ storage });
const TextSchema = new mongoose.Schema({
    text: { type: String, required: true },
  });
  
  const TextModel = mongoose.model("text", TextSchema);
// Upload Image Route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const newImage = new ImageModel({
      image: req.file.buffer,
      contentType: req.file.mimetype,
    });

    await newImage.save();
    res.json({ message: "Image uploaded successfully", imageId: newImage._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


 
// Fetch Image Route
app.get("/image/:id", async (req, res) => {
  try {
    const image = await ImageModel.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Image not found" });

    res.set("Content-Type", image.contentType);
    res.send(image.image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
