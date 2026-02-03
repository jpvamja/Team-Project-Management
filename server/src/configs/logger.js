import winston from "winston";
import { env } from "./index.js";

const { combine, timestamp, printf, errors, json, colorize } = winston.format;

const devFormat = printf(
    ({ level, message, timestamp, stack, requestId }) =>
        `${timestamp} [${level}]${requestId ? ` [${requestId}]` : ""}: ${stack || message}`
);

const logger = winston.createLogger({
    level: env.NODE_ENV === "production" ? "info" : "debug",

    defaultMeta: {
        service: "backend-api",
        environment: env.NODE_ENV,
    },

    format:
        env.NODE_ENV === "production"
            ? combine(timestamp(), errors({ stack: true }), json())
            : combine(
                  colorize(),
                  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                  errors({ stack: true }),
                  devFormat
              ),

    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            handleRejections: true,
        }),
    ],

    exitOnError: false,
});

export const withRequestLogger = (req) => logger.child({ requestId: req.requestId });

export default logger;
