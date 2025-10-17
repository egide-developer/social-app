//routes/authRoutes.js

import express from "express";
import {
    register, login, sendCode, verifyCode, refreshTokenHandler, logout
} from "../controllers/authController.js";

import { validateBody } from "../validators/joiMiddleware.js";
import { registerSchema, loginSchema, sendCodeSchema, verifyCodeSchema, refreshSchema } from "../validators/authSchemas.js";

const router = express.Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/send-code", validateBody(sendCodeSchema), sendCode);
router.post("/verify-code", validateBody(verifyCodeSchema), verifyCode);
router.post("/refresh-token", validateBody(refreshSchema), refreshTokenHandler);
router.post("/logout", logout);

export default router;
