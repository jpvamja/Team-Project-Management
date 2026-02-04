import mongoose from "mongoose";
import crypto from "crypto";
import Auth from "./auth.model.js";
import User from "../user/user.model.js";
import RefreshToken from "./refreshToken.model.js";
import ApiError from "../../shared/errors/ApiError.js";
import { logger } from "../../configs/index.js";
import {
    getRefreshTokenExpiryDate,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from "../../shared/utils/jwt.utils.js";

export const registerUser = async (payload) => {
    const { name, email, password } = payload;

    logger.info("Register service started", { email });

    const existingAuth = await Auth.findOne({ email });
    if (existingAuth) {
        logger.warn("Registration blocked: email exists", { email });
        throw ApiError.conflict("Email already registered");
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        logger.debug("Starting MongoDB transaction", { email });

        const user = new User({ name, email });
        await user.save({ session });

        logger.info("User document created", {
            userId: user._id.toString(),
        });

        const auth = new Auth({
            userId: user._id,
            email: email,
            passwordHash: password,
            provider: "LOCAL",
        });
        await auth.save({ session });

        logger.info("Auth document created", {
            userId: user._id.toString(),
            provider: "local",
        });

        await session.commitTransaction();

        logger.info("User registration completed", {
            userId: user._id.toString(),
        });

        return {
            id: user._id,
            name: user.name,
            email: user.email,
        };
    } catch (error) {
        await session.abortTransaction();

        logger.error("User registration failed", {
            email,
            error: error.message,
            code: error.code,
        });

        if (error.code === 11000) {
            throw ApiError.conflict("Email already registered");
        }

        throw ApiError.internal("Registration failed");
    } finally {
        session.endSession();
        logger.debug("MongoDB session ended", { email });
    }
};

export const loginUser = async (payload) => {
    const { email, password } = payload;
    logger.info("Login service started", { email });

    const auth = await Auth.findOne({ email }).select("+passwordHash");

    if (!auth) {
        logger.warn("Login failed: auth not found", { email });
        throw ApiError.unauthorized("Invalid email or password");
    }

    const isMatch = await auth.comparePassword(password);
    if (!isMatch) {
        logger.warn("Login failed: invalid password", { email });
        throw ApiError.unauthorized("Invalid email or password");
    }

    const user = await User.findById(auth.userId);
    if (!user) {
        logger.error("Login failed: user record missing", {
            authId: auth._id.toString(),
        });
        throw ApiError.internal("Login failed");
    }

    if (!user.isActive) {
        logger.warn("Login blocked: user disabled", {
            userId: user._id.toString(),
        });
        throw ApiError.unauthorized("Account disabled");
    }

    logger.info("Login credentials validated", {
        userId: auth.userId.toString(),
    });

    const accessToken = signAccessToken({
        userId: user._id,
        role: user.role,
    });
    const refreshToken = signRefreshToken({
        userId: user._id,
    });

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: getRefreshTokenExpiryDate(),
    });

    auth.lastLoginAt = new Date();
    await auth.save({ validateBeforeSave: false });

    logger.info("Login successful", {
        userId: auth.userId.toString(),
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};

export const refreshAccessToken = async (incomingRefreshToken) => {
    logger.debug("Refresh token verification started");

    let decoded;

    try {
        decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
        logger.warn("Invalid refresh token signature");
        throw ApiError.unauthorized("Invalid refresh token");
    }

    const storedToken = await RefreshToken.findOne({
        userId: decoded.userId,
        token: incomingRefreshToken,
        isRevoked: false,
    });

    if (!storedToken) {
        logger.error("Refresh token reuse detected", {
            userId: decoded.userId,
        });
        await RefreshToken.updateMany({ userId: decoded.userId }, { isRevoked: true });

        throw ApiError.unauthorized("Refresh token reuse detected");
    }

    if (storedToken.expiresAt < new Date()) {
        throw ApiError.unauthorized("Refresh token expired");
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
        throw ApiError.unauthorized("Account disabled");
    }

    logger.info("Refresh token validated", {
        userId: decoded.userId,
    });

    storedToken.isRevoked = true;
    await storedToken.save();

    const newAccessToken = signAccessToken({
        userId: user._id,
        role: user.role,
    });

    const newRefreshToken = signRefreshToken({
        userId: user._id,
    });

    await RefreshToken.create({
        userId: user._id,
        token: newRefreshToken,
        expiresAt: getRefreshTokenExpiryDate(),
    });

    logger.info("Refresh token rotated", {
        userId: decoded.userId,
        oldTokenId: storedToken._id.toString(),
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

export const logoutUser = async (incomingRefreshToken) => {
    let decoded;

    try {
        decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
        logger.warn("Logout skipped: invalid refresh token");
        return;
    }

    if (decoded.tokenType !== "refresh") return;

    const tokenDoc = await RefreshToken.findOne({
        userId: decoded.userId,
        token: incomingRefreshToken,
        isRevoked: false,
    });

    if (!tokenDoc) {
        logger.debug("Logout skipped: token already revoked");
        return;
    }

    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    logger.info("User logged out (single device)", {
        userId: decoded.userId,
        refreshTokenId: tokenDoc._id.toString(),
    });
};

export const changeUserPassword = async (userId, payload) => {
    const { oldPassword, newPassword } = payload;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const auth = await Auth.findOne({ userId })
            .select("+passwordHash")
            .session(session);

        if (!auth) throw ApiError.notFound("Auth record not found");

        const isMatch = await auth.comparePassword(oldPassword);
        if (!isMatch) throw ApiError.unauthorized("Current password incorrect");

        auth.passwordHash = newPassword;
        auth.passwordChangedAt = new Date();

        await auth.save({ session });
        await RefreshToken.deleteMany({ userId }).session(session);

        await session.commitTransaction();
        logger.info("Password changed", { userId });
    } catch (e) {
        await session.abortTransaction();
        throw e;
    } finally {
        session.endSession();
    }
};

export const forgotUserPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) return null;

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpiresAt = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    logger.info("Password reset token generated", { userId: user._id });

    return token;
};

export const resetUserPassword = async (token, newPassword) => {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashed,
        resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) throw ApiError.badRequest("Invalid or expired reset token");

    const auth = await Auth.findOne({ userId: user._id }).select("+passwordHash");
    if (!auth) throw ApiError.internal("Auth record missing");

    auth.passwordHash = newPassword;
    auth.passwordChangedAt = new Date();

    await auth.save();

    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save({ validateBeforeSave: false });

    await RefreshToken.deleteMany({ userId: user._id });

    logger.info("Password reset successful", { userId: user._id });
};