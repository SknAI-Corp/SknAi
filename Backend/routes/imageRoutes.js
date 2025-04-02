import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import Image from "../models/Image.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, async (error, cloudinaryResult) => {
      if (error) return res.status(500).json({ error: error.message });
      try {
        const newImage = new Image({ imageUrl: cloudinaryResult.secure_url });
        await newImage.save();
        res.json({ message: "Image uploaded successfully!", imageUrl: cloudinaryResult.secure_url });
      } catch (dbError) {
        res.status(500).json({ error: "Failed to save image in database" });
      }
    });
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;