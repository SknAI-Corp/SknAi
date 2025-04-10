import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static('/public'))
app.use(cookieParser());

import userRouter from './routes/user.route.js'
import sessionRouter from './routes/session.route.js'
import messageRoutes from "./routes/message.route.js";
import reportRoutes from "./routes/report.route.js";
import doctorRoutes from "./routes/doctor.route.js";
import adminRoutes from "./routes/admin.route.js";

app.use("/api/v1/users", userRouter)
app.use("/api/v1/session", sessionRouter)
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/doctor", doctorRoutes);
app.use("/api/v1/admin", adminRoutes);


// http://localhost:8000/api/v1/users/register

export default app

