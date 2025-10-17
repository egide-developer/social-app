import RefreshToken from "../models/RefreshToken.js";
import { generateRefreshTokenRaw, hashToken, refreshTokenExpiryDate } from "./jwt.js";

/**
 * Create refresh token, store hashed, return raw + expiry
 */
export async function createRefreshTokenForUser(userId, userAgent = "") {
    const raw = generateRefreshTokenRaw();
    const hashed = hashToken(raw);
    const expiresAt = refreshTokenExpiryDate();

    const rt = new RefreshToken({
        user: userId,
        tokenHash: hashed,
        expiresAt,
        userAgent,
    });
    await rt.save();
    return { raw, expiresAt };
}
