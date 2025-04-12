import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
});

// Upload from local file path
const uploadOnCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) return null;

    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: 'auto',
    });

    console.log("File uploaded successfully!", response.url);

    if (fs.existsSync(localfilePath)) fs.unlinkSync(localfilePath);
    return response;
  } catch (error) {
    if (fs.existsSync(localfilePath)) fs.unlinkSync(localfilePath);
    return null;
  }
};


// Upload from buffer (for Puppeteer PDF)
const uploadBufferToCloudinary = (buffer, sessionId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        format: "pdf",
        folder: "sknai",
        public_id: `sknai/report_${sessionId}`,
        type: "upload"
<<<<<<< Updated upstream
      },
=======
      },
>>>>>>> Stashed changes
      (error, result) => {
        if (error) {
          console.error("Cloudinary buffer upload error:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

export { uploadOnCloudinary, uploadBufferToCloudinary };