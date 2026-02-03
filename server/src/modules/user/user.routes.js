import { Router } from "express";
import { userCheck } from "./user.controller.js";
import authMiddleware from "../../shared/middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authMiddleware, userCheck);

export default router;
