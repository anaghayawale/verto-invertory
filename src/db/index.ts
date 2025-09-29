import mongoose from "mongoose";
import { DB_NAME } from "../constants";
import { logger } from "../utils/logger";

const connectDB = async (): Promise<void> => {
  try {
    // Ensure MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    logger.info(`MongoDB connected !! DB host name: ${connectionInstance.connection.host}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("MONGODB CONNECTION FAILED:", error.message);
    } else {
      logger.error("MONGODB CONNECTION FAILED: Unknown error");
    }
    process.exit(1);
  }
};

export default connectDB;
