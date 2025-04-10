import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadOnCloudinary } from './cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateAndUploadPDF = async ({
  userName,
  userEmail,
  aiReportText,
  imageUrls = [],
  sessionId
}) => {
  try {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const fileName = `report_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(tempDir, fileName);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Title and Patient Info
    doc.fontSize(20).text("Dermatology Report", { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Patient Name: ${userName}`);
    doc.text(`Email: ${userEmail}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`).moveDown();

    // AI Generated Report
    doc.fontSize(14).text("AI Generated Summary:", { underline: true }).moveDown(0.5);
    doc.fontSize(12).text(aiReportText).moveDown();

    // Images
    for (const imageUrl of imageUrls) {
      try {
        const imagePath = await downloadImageToTemp(imageUrl, tempDir);
        doc.addPage();
        doc.fontSize(14).text("Image:", { underline: true }).moveDown(0.5);
        doc.image(imagePath, {
          fit: [450, 450],
          align: 'center',
          valign: 'center'
        });
        fs.unlinkSync(imagePath); // Clean up temp image
      } catch (err) {
        console.error("Failed to add image:", err.message);
      }
    }

    doc.end();

    // Wait for PDF to finish writing
    await new Promise(resolve => writeStream.on('finish', resolve));

    // Upload to Cloudinary
    const uploaded = await uploadOnCloudinary(filePath);

    // Clean up the temporary file after upload
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error("Failed to delete temp PDF:", e.message);
    }

    return uploaded?.url || null;
  } catch (error) {
    console.error("PDF generation error:", error.message);
    return null;
  }
};

// Helper to download images to temp directory
const downloadImageToTemp = async (url, tempDir) => {
  const axios = await import('axios');
  const { default: fsExtra } = await import('fs-extra');

  const response = await axios.default({
    method: 'GET',
    url,
    responseType: 'stream'
  });

  const fileName = `img_${Date.now()}.jpg`;
  const filePath = path.join(tempDir, fileName);
  const writer = fs.createWriteStream(filePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
};
