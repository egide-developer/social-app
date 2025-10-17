//utils/tokenUtils.js
import RefreshToken from "../models/RefreshToken";
import { generateRefreshTokenRaw, hashToken, refreshTokenExpiryDate } from "./jwt";

/**
 * Create refresh token raw, store hashed, return raw + expiry
 */
export async function createRefreshTokenForUser(userId, userAgent = "", minutesExpiry = 20) {
    const raw = generateRefreshTokenRaw();
    const hashed = hashToken(raw);
    const expiresAt = refreshTokenExpiryDate(); // uses REFRESH_TOKEN_EXPIRES_MIN
    const rt = new RefreshToken({
        user: userId,
        tokenHash: hashed,
        expiresAt,
        userAgent,
    });
    await rt.save();
    return { raw, expiresAt };
}