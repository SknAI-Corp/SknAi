// utils/pdfUploader.js
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { uploadOnCloudinary } from "./cloudinary.js";

// Generates PDF, uploads to Cloudinary, and returns the URL
export const generateAndUploadPDF = async ({
  userName,
  userEmail,
  aiReportText,
  imageUrls = [],
  sessionId
}) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const filePath = `./temp/report-${sessionId}.pdf`;

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Title
    doc.fontSize(20).text("🧾 AI Dermatology Report", { align: "center" });
    doc.moveDown();

    // User Info
    doc.fontSize(12).text(`👤 Name: ${userName}`);
    doc.text(`📧 Email: ${userEmail}`);
    doc.moveDown();

    // Report Content
    doc.fontSize(14).text("📄 AI Generated Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(aiReportText, {
      align: "left"
    });
    doc.moveDown();

    // Images Section
    if (imageUrls.length > 0) {
      doc.fontSize(14).text("🖼️ Uploaded Images", { underline: true });
      doc.moveDown(0.5);

      for (const url of imageUrls) {
        try {
          doc.image(url, {
            fit: [400, 300],
            align: "center"
          });
          doc.moveDown();
        } catch (err) {
          doc.text("⚠️ Failed to load image.");
        }
      }
    }

    doc.end();

    writeStream.on("finish", async () => {
      const cloudRes = await uploadOnCloudinary(filePath);
      fs.unlinkSync(filePath);

      if (cloudRes?.url) {
        resolve(cloudRes.url);
      } else {
        reject("Cloudinary upload failed");
      }
    });

    writeStream.on("error", reject);
  });
};
