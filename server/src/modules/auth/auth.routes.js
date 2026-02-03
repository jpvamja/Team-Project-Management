import { Router } from "express";
import validatorMiddleware from "../../shared/middlewares/validate.middleware.js";
import { authRateLimiter } from "../../shared/middlewares/rateLimit.middleware.js";
import { register, login, refresh, logout } from "../auth/auth.controller.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "../auth/auth.validation.js";

const router = Router();

router.post("/register", authRateLimiter, validatorMiddleware(registerSchema), register);

router.post("/login", authRateLimiter, validatorMiddleware(loginSchema), login);

router.post("/refresh", validatorMiddleware(refreshTokenSchema), refresh);

router.post("/logout", validatorMiddleware(refreshTokenSchema), logout);
export default router;
