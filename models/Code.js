import mongoose from "mongoose";

const codeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
});

// TTL index automatically deletes expired codes
codeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Code", codeSchema);
