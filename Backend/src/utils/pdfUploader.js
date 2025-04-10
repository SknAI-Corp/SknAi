<<<<<<< Updated upstream
import puppeteer from 'puppeteer';
import { generateHTMLReport } from './reportTemplate.js';
import { uploadBufferToCloudinary } from './cloudinary.js'; // ✅ new function
=======
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { uploadOnCloudinary } from "./cloudinary.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
>>>>>>> Stashed changes

export const generateAndUploadPDF = async ({
  userName,
  userEmail,
  aiReportText,
  imageUrls = [],
  sessionId,
  doctorRemarks = null
}) => {
<<<<<<< Updated upstream
  try {
    const html = generateHTMLReport({
      userName,
      userEmail,
      aiReportText,
      imageUrls,
      date: new Date().toLocaleDateString(),
      doctorRemarks
    });

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" }
    });

    await browser.close();

    // ⬆️ Upload from buffer
    const pdfUrl = await uploadBufferToCloudinary(pdfBuffer, sessionId);
    return pdfUrl;

  } catch (error) {
    console.error("PDF generation error:", error.message);
    return null;
  }
};
=======
  return new Promise((resolve, reject) => {
    // Use absolute path for the PDF to ensure it's in the correct location
    const tempDir = path.resolve(__dirname, '../../public/temp');
    const filePath = path.join(tempDir, `report-${sessionId}.pdf`);

    // Ensure the directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true }); // Create the directory if it doesn't exist
    }

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Title
    doc.fontSize(20).text("🧾 AI Dermatology Report", { align: "center" });
    doc.moveDown();

    // User Info
    doc.fontSize(12).text( `Name: ${userName}`);
    doc.text(`Email: ${userEmail}`);
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
      doc.fontSize(14).text("🖼 Uploaded Images", { underline: true });
      doc.moveDown(0.5);

      for (const url of imageUrls) {
        try {
          doc.image(url, {
            fit: [400, 300],
            align: "center"
          });
          doc.moveDown();
        } catch (err) {
          doc.text("⚠ Failed to load image.");
        }
      }
    }

    doc.end();

    // Listen for the finish event and upload the file to Cloudinary
    writeStream.on("finish", async () => {
      try {
        // Check if the file exists before uploading it
        if (fs.existsSync(filePath)) {
          console.log("File exists, uploading to Cloudinary:", filePath);  // Debugging log
          const cloudRes = await uploadOnCloudinary(filePath);

          // Check if upload was successful
          // if (cloudRes?.url) {
          //   console.log(filePath);  // Debugging log
          //   fs.unlinkSync(filePath); // Clean up the local file after successful upload
          //   resolve(cloudRes.url); // Return the Cloudinary URL
          // } else {
          //   reject("Cloudinary upload failed");
          // }
        } else {
          reject(`PDF file does not exist at ${filePath}`);
        }
      } catch (uploadError) {
        reject(Error `uploading to Cloudinary: ${uploadError.message}`);
      }
    });

    // Handle file writing errors
    writeStream.on("error", (err) => {
      console.error("File writing error:", err.message);
      fs.unlinkSync(filePath); // Clean up the file if an error occurs
      reject(Error `generating PDF: ${err.message}`);
    });
  });
};
>>>>>>> Stashed changes
