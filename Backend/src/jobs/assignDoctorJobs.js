// jobs/assignDoctorJob.js
import { Report } from "../models/report.model.js";
import { Doctor } from "../models/doctor.model.js";

// Assigns unassigned reports to the best doctor
export const assignDoctorsToPendingReports = async () => {
  try {
    const unassignedReports = await Report.find({
      status: "pending",
      assignedDoctor: { $exists: false }
    });

    if (!unassignedReports.length) return;

    for (const report of unassignedReports) {
      const doctors = await Doctor.aggregate([
        {
          $lookup: {
            from: "reports",
            localField: "_id",
            foreignField: "assignedDoctor",
            as: "assignedReports"
          }
        },
        {
          $addFields: {
            activeReports: {
              $size: {
                $filter: {
                  input: "$assignedReports",
                  as: "rep",
                  cond: { $eq: ["$$rep.status", "pending"] }
                }
              }
            },
            performanceScore: {
              $subtract: [100, "$activeReports"] // Simple logic: fewer pending reports = higher priority
            }
          }
        },
        { $sort: { performanceScore: -1 } }
      ]);

      if (!doctors.length) continue;

      const bestDoctor = doctors[0];
      report.assignedDoctor = bestDoctor._id;
      await report.save();

      await Doctor.findByIdAndUpdate(bestDoctor._id, {
        $inc: { currentlyAssigned: 1 }
      });

      console.log(`✅ Assigned report ${report._id} to Dr. ${bestDoctor.name}`);
    }
  } catch (err) {
    console.error("❌ Doctor assignment failed:", err);
  }
};
