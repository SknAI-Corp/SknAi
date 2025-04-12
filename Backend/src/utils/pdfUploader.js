<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
import fs from "fs";
import path from "path";
import { uploadOnCloudinary, uploadBufferToCloudinary } from "./cloudinary.js";
import { fileURLToPath } from "url";
import { generateHTMLReport } from "./reportTemplate.js";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);

export const generateAndUploadPDF = async ({
  userName,
  userEmail,
  aiReportText,
  imageUrls = [],
  sessionId,
  doctorRemarks = null
}) => {
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

    // ⬆ Upload from buffer
    const pdfUrl = await uploadBufferToCloudinary(pdfBuffer, sessionId);
    return pdfUrl;

  } catch (error) {
    console.error("PDF generation error:", error.message);
    return null;
  }
};