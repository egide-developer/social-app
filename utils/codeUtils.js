import Code from "../models/Code.js";

/**
 * Create and save a numeric code for a user (rate limited)
 * @param {*} userId 
 * @param {*} type - "verify-email", "reset-password", etc.
 * @param {*} expiresInDays 
 */
export async function createAndSaveCode(userId, type, expiresInDays = 14) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Rate limiting: max 3 codes per 10 minutes
    const recentCount = await Code.countDocuments({
        user: userId,
        type,
        createdAt: { $gte: tenMinutesAgo },
    });
    if (recentCount >= 3) {
        throw new Error("You can only request a verification email 3 times in 10 minutes.");
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    const codeDoc = new Code({
        userId,
        type,
        code,
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    });

    await codeDoc.save();
    return codeDoc;
}

/**
 * Verify code and consume it (delete all codes of same type for user)
 */
export async function findAndConsumeCode(userId, codeValue, type) {
    const codeDoc = await Code.findOne({ userId, code: codeValue, type });
    if (!codeDoc) return null;
    await Code.deleteMany({ userId, type });
    return codeDoc;
}
