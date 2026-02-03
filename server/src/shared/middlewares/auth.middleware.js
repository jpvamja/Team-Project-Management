import ApiError from "../errors/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import { AUTH_CONSTANTS } from "../../modules/auth/auth.constants.js";

const authMiddleware = (req, res, next) => {
    const header = req.headers[AUTH_CONSTANTS.AUTH_HEADER];

    if (!header || !header.startsWith(AUTH_CONSTANTS.TOKEN_PREFIX)) {
        return next(ApiError.unauthorized("Missing access token"));
    }

    const token = header.slice(AUTH_CONSTANTS.TOKEN_PREFIX.length).trim();

    try {
        const decoded = verifyAccessToken(token);
        req.user = {
            id: decoded.userId,
            role: decoded.role,
        };
        next();
    } catch (err) {
        return next(ApiError.unauthorized("Invalid or expired access token"));
    }
};

export default authMiddleware;
