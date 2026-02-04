import ApiResponse from "../../shared/responses/ApiResponse.js";
import ApiError from "../../shared/errors/ApiError.js";
import asyncHandler from "../../shared/utils/asyncHandler.utils.js";
import pick from "../../shared/utils/pick.utils.js";
import { env, refreshTokenCookieOptions } from "../../configs/index.js";
import { logger } from "../../configs/index.js";
import { 
    registerUser, 
    loginUser, 
    refreshAccessToken, 
    logoutUser, 
    changeUserPassword,
    forgotUserPassword ,
    resetUserPassword
} from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
    const payload = pick(req.body, ["name", "email", "password"]);

    logger.info("Register request received", {
        email: payload.email,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    const user = await registerUser(payload);

    logger.info("Register request successful", {
        userId: user.id,
        email: user.email,
    });

    return ApiResponse.created(res, user, "User registered successfully");
});

export const login = asyncHandler(async (req, res) => {
    const payload = pick(req.body, ["email", "password"]);

    logger.info("Login request received", {
        email: payload.email,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    const { accessToken, refreshToken, user } = await loginUser(payload);

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    logger.info("Login request successful", {
        userId: user.id,
        email: user.email,
    });

    return ApiResponse.success(
        res,
        {
            accessToken,
            user,
        },
        "User login successfully"
    );
});

export const refresh = asyncHandler(async (req, res) => {
    logger.debug("Refresh token request received", {
        ip: req.ip,
        hasCookie: Boolean(req.cookies?.refreshToken),
    });

    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw ApiError.unauthorized("Refresh token missing");
    }

    const tokens = await refreshAccessToken(refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production" ? true : false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info("Access token refreshed", {
        userId: tokens.userId,
    });

    return ApiResponse.success(res, { accessToken: tokens.accessToken }, "Access token refreshed");
});

export const logout = asyncHandler(async (req, res) => {
    logger.info("Logout request received", {
        hasCookie: Boolean(req.cookies?.refreshToken),
        ip: req.ip,
    });

    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
        await logoutUser(refreshToken);
    }

    res.clearCookie("refreshToken", refreshTokenCookieOptions);

    logger.info("Logout completed successfully");

    return ApiResponse.success(res, null, "Logged out successfully");
});

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const payload = pick(req.body, ["oldPassword", "newPassword"]);

  await changeUserPassword(userId, payload);

  return ApiResponse.success(res, null, "Password changed successfully. Please login again.");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const token = await forgotUserPassword(email);

  return ApiResponse.success(res, { resetToken: token }, "Password reset token generated");
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  await resetUserPassword(token, newPassword);

  return ApiResponse.success(res, null, "Password reset successful. Please login.");
});


