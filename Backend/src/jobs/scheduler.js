import cron from "node-cron";
import { assignDoctorsToPendingReports } from "./assignDoctorJobs.js";

cron.schedule("0 */2 * * *", async () => {
  console.log("⏰ Running cron report assignment job...");
  await assignDoctorsToPendingReports("cron");
});
