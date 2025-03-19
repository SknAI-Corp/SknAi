import { Client } from "@gradio/client";
import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup multer for file uploads
const upload = multer({ dest: "uploads/" });

// Hugging Face API Endpoint
const HF_API_URL = "https://Team-SknAI-Demo-v4.hf.space"; // Update with your actual API URL

// Handle image upload and prediction
app.post("/predict", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    
    try {
        const imageData = fs.readFileSync(req.file.path);
        
        const client = await Client.connect(HF_API_URL);
        const result = await client.predict("/predict", { 
            image: imageData, 
        });
        
        // Remove the uploaded image after processing
        fs.unlinkSync(req.file.path);
        
        res.json({ prediction: result.data });
    } catch (error) {
        res.status(500).json({ error: "Error processing image" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
