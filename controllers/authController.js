// controllers/authController.js
import User from "../models/User.js";
import Code from "../models/Code.js";
import RefreshToken from "../models/RefreshToken.js";
import { signAccessToken, generateRefreshTokenRaw, hashToken, refreshTokenExpiryDate } from "../utils/jwt.js";
import { sendEmail } from "../utils/mailer.js";
import { daysFromNow } from "../utils/time.js";
import crypto from "crypto";
import { createAndSaveCode, findAndConsumeCode } from "../utils/codeUtils.js";

/* ---------- Controller actions ---------- */

const CODE_EXPIRES_DAYS = Number(process.env.CODE_EXPIRES_DAYS || 14);

export async function register(req, res) {
    try {
        // validated body is in req.validated from middleware
        const body = req.validated;
        // ensure uniqueness
        const [existsEmail, existsUser] = await Promise.all([
            User.findOne({ email: body.email }),
            User.findOne({ username: body.username }),
        ]);
        if (existsEmail) return res.status(409).json({ message: "Email already registered" });
        if (existsUser) return res.status(409).json({ message: "Username already taken" });

        const user = new User(body);
        await user.save();

        // create verification code (reusable function)
        const code = await createAndSaveCode(user._id, "verify-email", CODE_EXPIRES_DAYS);

        // send email (reusable sendEmail)
        await sendEmail({
            to: user.email,
            subject: "Verify your account",
            text: `Your verification code is: ${code}`,
            html: `<p>Your verification code is: <b>${code}</b></p>`,
        });

        return res.status(201).json({ message: "User created. Verification code sent if email configured." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function login(req, res) {
    try {
        const { identifier, password } = req.validated;

        // Find by email OR username
        const user = await User.findOne({
            $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
        });

        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const ok = await user.comparePassword(password);
        if (!ok) return res.status(401).json({ message: "Invalid credentials" });

        // If user is not verified, return minimal info with reason
        if (!user.isVerified) {
            try {
                const codeDoc = await createAndSaveCode(user._id, "verify-email", 14);
                await sendVerificationEmail(user, codeDoc.code);

                return res.json({
                    reason: "not verified",
                    message: "A new verification code has been sent to your email.",
                    user: {
                        id: user._id,
                        email: user.email,
                        username: user.username,
                    },
                });
            } catch (err) {
                return res.status(429).json({
                    reason: "rate limit exceeded",
                    message: "You can only request a verification email 3 times in 10 minutes.",
                });
            }
        }


        // User is verified → generate tokens
        const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });

        const { raw: refreshToken, expiresAt } = await createRefreshTokenForUser(
            user._id,
            req.get("User-Agent") || ""
        );

        return res.json({
            accessToken,
            refreshToken,
            refreshExpiresAt: expiresAt,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                isVerified: user.isVerified,
                profile: user.profile,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}



export async function sendCode(req, res) {
    try {
        const { email, type } = req.validated;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const code = await createAndSaveCode(user._id, type, CODE_EXPIRES_DAYS);

        await sendEmail({
            to: user.email,
            subject: `Your ${type} code`,
            text: `Your code is: ${code}`,
            html: `<p>Your code is: <b>${code}</b></p>`,
        });

        return res.json({ message: "Code sent (if email configured)" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function verifyCode(req, res) {
    try {
        const { email, code, type } = req.validated;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const found = await findAndConsumeCode(user._id, code, type);
        if (!found) return res.status(400).json({ message: "Invalid or expired code" });

        // successful verification actions
        if (type === "verify-email") {
            user.isVerified = true;
            await user.save();
        }

        return res.json({ message: "Code verified" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function refreshTokenHandler(req, res) {
    try {
        const { refreshToken } = req.validated;
        const hashed = hashToken(refreshToken);
        const tokenDoc = await RefreshToken.findOne({ tokenHash: hashed });
        if (!tokenDoc || tokenDoc.revoked) return res.status(401).json({ message: "Invalid refresh token" });
        if (tokenDoc.expiresAt < new Date()) return res.status(401).json({ message: "Refresh token expired" });

        // rotate - revoke the existing token and issue a new one
        tokenDoc.revoked = true;
        await tokenDoc.save();

        const user = await User.findById(tokenDoc.user);
        if (!user) return res.status(404).json({ message: "User not found" });

        const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
        const { raw: newRaw, expiresAt } = await createRefreshTokenForUser(user._id, req.get("User-Agent") || "");

        return res.json({ accessToken, refreshToken: newRaw, refreshExpiresAt: expiresAt });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function logout(req, res) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });
        const hashed = hashToken(refreshToken);
        await RefreshToken.updateMany({ tokenHash: hashed }, { revoked: true });
        return res.json({ message: "Logged out" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}
