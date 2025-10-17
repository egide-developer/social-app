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

/**
 * Send email or fallback to console
 */
export async function sendEmail({ to, subject, text, html }) {
    if (!transporter) {
        console.log("[MAIL-FALLBACK]", { to, subject, text });
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
