import { assignDoctorsToPendingReports } from "../jobs/assignDoctorJobs.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const manuallyAssignReports = async (req, res) => {
  const results = await assignDoctorsToPendingReports("api");

  return res.status(200).json(new ApiResponse(
    `Manually assigned ${results.length} report(s) to doctors`,
    results,
    200
  ));
};
