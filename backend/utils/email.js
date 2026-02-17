/**
 * Simple email sending via SMTP (Nodemailer).
 * Configure with SMTP_* and BASE_URL in .env.
 * If SMTP is not configured, logs the message instead of sending.
 */

const nodemailer = require('nodemailer');

const APP_NAME = process.env.APP_NAME || 'FitCommunity';
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: port === '465',
    auth: { user, pass },
  });
}

/**
 * Send an email. If SMTP is not configured, logs to console and resolves (no error).
 */
async function sendEmail({ to, subject, text, html }) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@fitcommunity.app';

  if (!transporter) {
    console.log('[Email not configured] Would send:', { to, subject, text: text?.slice(0, 80) });
    return;
  }

  try {
    await transporter.sendMail({
      from: `${APP_NAME} <${from}>`,
      to,
      subject,
      text: text || (html && html.replace(/<[^>]+>/g, '')),
      html: html || undefined,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
    throw err;
  }
}

/**
 * Send sign-up confirmation email with verification link.
 */
async function sendVerificationEmail(email, token) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: `Confirm your ${APP_NAME} account`,
    text: `Welcome to ${APP_NAME}! Please confirm your email by opening this link:\n\n${url}\n\nIf you didn't create an account, you can ignore this email.`,
    html: `
      <p>Welcome to ${APP_NAME}!</p>
      <p>Please confirm your email by clicking the link below:</p>
      <p><a href="${url}">Confirm my email</a></p>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
  });
}

/**
 * Send password reset email with link.
 */
async function sendPasswordResetEmail(email, token) {
  if (BASE_URL.includes('localhost')) {
    console.warn('[Email] BASE_URL is localhost — reset links will only work when opened on the same machine. Set BASE_URL in .env to your machine IP (e.g. http://192.168.1.100:3000) for links to work on phones/other devices.');
  }
  const url = `${BASE_URL}/api/auth/reset-password-page?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    text: `You requested a password reset. Open this link to set a new password:\n\n${url}\n\nThis link expires in 1 hour. If you didn't request a reset, ignore this email.`,
    html: `
      <p>You requested a password reset for ${APP_NAME}.</p>
      <p><a href="${url}">Set a new password</a></p>
      <p>This link expires in 1 hour. If you didn't request a reset, you can ignore this email.</p>
    `,
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
