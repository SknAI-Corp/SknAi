import puppeteer from 'puppeteer';
import { generateHTMLReport } from './reportTemplate.js';
import { uploadBufferToCloudinary } from './cloudinary.js'; // ✅ new function

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

    // ⬆️ Upload from buffer
    const pdfUrl = await uploadBufferToCloudinary(pdfBuffer, sessionId);
    return pdfUrl;

  } catch (error) {
    console.error("PDF generation error:", error.message);
    return null;
  }
};
