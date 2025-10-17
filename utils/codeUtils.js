// utils/codeUtils.js (or wherever you handle codes)
import Code from "../models/Code.js"; // your code model

export async function createAndSaveCode(userId, type, expiresInDays = 14) {
    // Count how many codes were sent in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCount = await Code.countDocuments({
        user: userId,
        type,
        createdAt: { $gte: tenMinutesAgo }
    });

    if (recentCount >= 3) {
        throw new Error("You can only request a verification email 3 times in 10 minutes.");
    }

    // Generate a new code
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    const codeDoc = new Code({
        user: userId,
        type,
        code,
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    });

    await codeDoc.save();
    return codeDoc;
}


/**
 * Verify code value and optional delete on success
 */
export async function findAndConsumeCode(userId, codeValue, type) {
    const codeDoc = await Code.findOne({ userId, code: codeValue, type });
    if (!codeDoc) return null;
    // consume: delete codes of that type for user
    await Code.deleteMany({ userId, type });
    return codeDoc;
}

/**
 * Create 6-digit numeric code as string
 */
export function createNumericCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}