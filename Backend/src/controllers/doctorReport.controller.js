import { Report } from "../models/report.model.js";
import { generateAndUploadPDF } from "../utils/pdfUploader.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// GET /doctor/reports
const getAssignedReports = async (req, res) => {
  const reports = await Report.find({ doctorId: req.doctor._id }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse("Assigned reports", reports, 200));
};

// PATCH /doctor/reports/:id/review
const submitDoctorRemarks = async (req, res) => {
  const { id } = req.params;
  const { doctorRemarks } = req.body;

  const report = await Report.findById(id).populate("userId");

  if (!report || report.doctorId?.toString() !== req.doctor._id.toString()) {
    throw new ApiError(403, "Access denied or report not found");
  }

  report.doctorRemarks = doctorRemarks;
  report.status = "done";
  report.reviewedAt = new Date();

  const pdfUrl = await generateAndUploadPDF({
    userName: report.userId.firstName,
    userEmail: report.userId.email,
    aiReportText: report.aiGeneratedSummary,
    doctorRemarks,
    imageUrls: report.images,
    sessionId: report.sessionId
  });

  report.reportPdfUrl = pdfUrl;
  await report.save();

  return res.status(200).json(new ApiResponse("Remarks submitted", report, 200));
};

export { getAssignedReports, submitDoctorRemarks };
