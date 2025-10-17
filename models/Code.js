//models/Code.js

import mongoose from "mongoose";

/**
 * Codes (e.g., verify-email, reset-password).
 * We store the code in plaintext here for simplicity, but we also
 * record expiresAt. In production consider storing a hashed code.
 */
const codeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    code: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }, // e.g., 'verify-email'
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
});

// TTL index to remove expired codes automatically
codeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Code", codeSchema);
