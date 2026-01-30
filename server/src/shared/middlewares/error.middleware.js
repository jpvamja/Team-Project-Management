import ApiError from "../../shared/errors/ApiError.js";
import { env } from "../../configs/index.js";
import { HTTP_STATUS } from "../constants/httpStatus.constant.js";

const errorMiddleware = (err, req, res, next) => {
    let error = err;

    if (error.name === "CastError") {
        error = ApiError.badRequest("Invalid resource ID");
    } else if (error.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0];
        error = ApiError.conflict(`Duplicate value for ${field}`, [
            { field, message: "Already exists" },
        ]);
    } else if (error.name === "ValidationError") {
        const errors = Object.values(error.errors || {}).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        error = ApiError.badRequest("Validation failed", errors);
    } else if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        error = ApiError.unauthorized("Unauthorized");
    }

    if (!(error instanceof ApiError)) {
        error = ApiError.internal(error.message || "Internal Server Error");
    }

    const logPayload = {
        message: error.message,
        statusCode: error.statusCode,
        method: req.method,
        path: req.originalUrl,
        requestId: req.requestId,
    };

    if (error.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        console.error({ ...logPayload, stack: error.stack });
    } else {
        console.error(logPayload);
    }

    const response = {
        success: false,
        message: error.message,
    };

    if (env.NODE_ENV === "development") {
        response.errors = error.errors || [];
        response.stack = error.stack;
    }

    res.status(error.statusCode).json(response);
};

export default errorMiddleware;
