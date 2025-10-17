// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const profileSchema = new mongoose.Schema({
    bio: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: "image.png"
    },
    links: {
        type: [String],
        default: []
    },
});

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    dob: {
        type: Date
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "other"
    },
    profile: {
        type: profileSchema,
        default: () => ({})
    },
    createdAt: {
        type: Date, default: Date.now
    },
});


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = function (candidate) {
    if (!this.password) return false;
    return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
