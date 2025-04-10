import 'dotenv/config'
import connectDB from './db/index.js';
import app from './app.js';
import "./jobs/scheduler.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGODB CONNECTION FAILED: ", err)
})