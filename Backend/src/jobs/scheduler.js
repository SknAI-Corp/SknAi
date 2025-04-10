// jobs/scheduler.js
import cron from "node-cron";
import { assignDoctorsToPendingReports } from "./assignDoctorJobs.js";

// Every 2 hours
cron.schedule("0 */2 * * *", async () => {
  console.log("⏰ Running doctor assignment job");
  await assignDoctorsToPendingReports();
});
