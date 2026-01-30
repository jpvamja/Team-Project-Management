import rateLimit from "express-rate-limit";
import { rateLimits } from "../../configs/index.js";
import ApiError from "../../shared/errors/ApiError.js";

const createRateLimiter = ({ windowMs, max }) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,

        handler: (req, res, next) => {
            next(ApiError.badRequest("Too many requests. Please try again later."));
        },
    });

export const globalRateLimiter = createRateLimiter(rateLimits.GLOBAL);

export const authRateLimiter = createRateLimiter(rateLimits.AUTH);

export const otpRateLimiter = createRateLimiter(rateLimits.OTP);
