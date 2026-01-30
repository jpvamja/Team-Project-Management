import mongoose from "mongoose";
import { env, databaseConfig, logger } from "../configs/index.js";

const mongoLoader = async () => {
    try {
        mongoose.set("strictQuery", true);

        mongoose.connection.once("connected", () => {
            logger.info("MongoDB connection established");
        });

        mongoose.connection.on("error", (err) => {
            logger.error("MongoDB connection error", {
                message: err.message,
            });
        });

        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB disconnected");
        });

        await mongoose.connect(env.MONGO_URI, databaseConfig.options);
    } catch (err) {
        logger.error("MongoDB connection failed", {
            message: err.message,
            stack: env.NODE_ENV === "development" ? err.stack : undefined,
        });
        process.exit(1);
    }
};

export default mongoLoader;
