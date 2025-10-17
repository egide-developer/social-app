// utils/mailer.js
import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

let transporter = null;
if (SMTP_HOST && SMTP_USER) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
}

export async function sendEmail({ to, subject, text, html }) {
    if (!transporter) {
        // fallback: log the message. Useful for local dev.
        console.log("[MAIL-FALLBACK] to:", to, "subject:", subject, "text:", text);
        return;
    }
    await transporter.sendMail({
        from: EMAIL_FROM || SMTP_USER,
        to,
        subject,
        text,
        html,
    });
}
