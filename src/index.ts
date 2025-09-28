import dotenv from "dotenv";
import connectDB from "./db/index";
import { app } from './app';
import { logger } from "./utils/logger";

// Load env variabls
dotenv.config({ path: "./.env" });

// Connect to database
connectDB().then(() => {
    app.on("error", (error) => {
        console.error("ERROR: ",error)
    })

    // Start Server
    const PORT: number = Number(process.env.PORT) || 8000
    app.listen(PORT, () => {
        logger.info(`VERTO INVENTORY RUNNING http://localhost:${process.env.PORT}`)
    })
}).catch((err) => {
    console.error("MONGODB CONNECTION FAILED:  ",err)
})