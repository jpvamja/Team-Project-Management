import ApiError from "../../shared/errors/ApiError.js";
import { env } from "../../configs/index.js";
import logger from "../../configs/logger.js";

const errorMiddleware = (err, req, res, next) => {
    let normalizedError = err;
    if (err.name === "CastError") {
        normalizedError = ApiError.badRequest("Invalid resource identifier");
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        normalizedError = ApiError.conflict("Duplicate field value", [
            {
                field,
                message: "Already exists",
            },
        ]);
    }

    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors || {}).map((e) => ({
            field: e.path,
            message: e.message,
        }));

        normalizedError = ApiError.badRequest("Validation failed", errors);
    }

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        normalizedError = ApiError.unauthorized("Unauthorized");
    }

    if (!(normalizedError instanceof ApiError)) {
        normalizedError = ApiError.internal(err.message || "Internal Server Error");
    }

    logger.error(normalizedError.message, {
        statusCode: normalizedError.statusCode,
        method: req.method,
        path: req.originalUrl,
        requestId: req.requestId,
        stack: normalizedError.stack,
    });

    const response = {
        success: false,
        message: normalizedError.message,
    };

    if (Array.isArray(normalizedError.errors) && normalizedError.errors.length) {
        response.errors = normalizedError.errors;
    }

    if (env.NODE_ENV === "development") {
        response.stack = normalizedError.stack;
    }

    res.status(normalizedError.statusCode).json(response);
};

export default errorMiddleware;
