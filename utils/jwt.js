import jwt from "jsonwebtoken";
import crypto from "crypto";
import { minutesFromNow } from "./time.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_MIN = Number(process.env.REFRESH_TOKEN_EXPIRES_MIN || 20);

/**
 * Sign JWT access token
 */
export function signAccessToken(payload) {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_SECRET);
}

/**
 * Generate raw refresh token
 */
export function generateRefreshTokenRaw() {
    return crypto.randomBytes(48).toString("hex");
}

/**
 * Hash token to store securely
 */
export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Get refresh token expiry date
 */
export function refreshTokenExpiryDate() {
    return minutesFromNow(REFRESH_MIN);
}
