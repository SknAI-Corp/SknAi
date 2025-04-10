import { Report } from "../models/report.model.js";
import { Doctor } from "../models/doctor.model.js";

export const assignDoctorsToPendingReports = async (mode = "cron") => {
  try {
    const unassignedReports = await Report.find({
      status: "pending",
      doctorId: { $exists: false }
    });

    if (!unassignedReports.length) {
      console.log(`✅ No unassigned reports found. [${mode}]`);
      return [];
    }

    const assigned = [];

    for (const report of unassignedReports) {
      const doctors = await Doctor.aggregate([
        {
          $lookup: {
            from: "reports",
            localField: "_id",
            foreignField: "doctorId",
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
              $subtract: [100, "$activeReports"]
            }
          }
        },
        { $sort: { performanceScore: -1 } }
      ]);

      if (!doctors.length) continue;

      const bestDoctor = doctors[0];
      report.doctorId = bestDoctor._id;
      await report.save();

      assigned.push({
        reportId: report._id,
        assignedTo: bestDoctor.name,
        doctorId: bestDoctor._id
      });

      console.log(`📋 Assigned report ${report._id} to Dr. ${bestDoctor.name} [${mode}]`);
    }

    return assigned;
  } catch (err) {
    console.error(`❌ Report assignment failed. [${mode}]`, err.message);
    return [];
  }
};
