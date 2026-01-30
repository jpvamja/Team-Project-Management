import app from "./app.js";
import { env, logger } from "./configs/index.js";

let server;

let startServer = () => {
    try {
        server = app.listen(env.PORT, () => {
            logger.info(`Server running on port ${env.PORT} (${env.NODE_ENV})`, {
                pid: process.pid,
                node: process.version,
            });
        });
    } catch (err) {
        logger.error("Failed to start server", {
            message: err.message,
            stack: env.NODE_ENV === "development" ? err.stack : undefined,
        });
        process.exit(1);
    }
};

process.on("unhandledRejection", (err) => {
    logger.error("UNHANDLED REJECTION", err);
    server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
    logger.error("UNCAUGHT EXCEPTION", err);
    process.exit(1);
});

startServer();
