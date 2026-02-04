import { Router } from "express";
import validatorMiddleware from "../../shared/middlewares/validate.middleware.js";
import { authRateLimiter } from "../../shared/middlewares/rateLimit.middleware.js";
import authMiddleware from "../../shared/middlewares/auth.middleware.js"
import {
    register,
    login,
    refresh,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
} from "../auth/auth.controller.js";
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from "../auth/auth.validation.js";

const router = Router();

router.post(
    "/register", 
    authRateLimiter, 
    validatorMiddleware(registerSchema), 
    register
);

router.post(
    "/login", 
    authRateLimiter, 
    validatorMiddleware(loginSchema), 
    login
);

router.post(
    "/refresh", 
    validatorMiddleware(refreshTokenSchema), 
    refresh
);

router.post(
    "/logout", 
    validatorMiddleware(refreshTokenSchema), 
    logout
);

router.post(
  "/change-password",
  authRateLimiter,
  authMiddleware,
  validatorMiddleware(changePasswordSchema),
  changePassword
);

router.post(
  "/forgot-password",
  authRateLimiter,
  validatorMiddleware(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  authRateLimiter,
  validatorMiddleware(resetPasswordSchema),
  resetPassword
);

export default router;

