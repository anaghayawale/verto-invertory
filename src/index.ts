import dotenv from "dotenv";
import connectDB from "./db/index";
import { app } from './app';
import { logger } from "./utils/logger";

dotenv.config({ path: "./.env" });

connectDB().then(() => {
    app.on("error", (error) => {
        console.error("ERROR: ",error)
    })

    const PORT: number = Number(process.env.PORT) || 3000
    app.listen(PORT, () => {
        logger.info(`VERTO INVENTORY RUNNING http://localhost:${process.env.PORT}`)
    })
}).catch((err) => {
    console.error("MONGODB CONNECTION FAILED:  ",err)
})