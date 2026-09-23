import nodemailer from 'nodemailer';
import { env } from './env';

export function createTransport() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

export function createBrevoTransport() {
  if (!env.smtpHostBr || !env.smtpUserBr || !env.smtpPassBr || !env.brevoFromEmail || !env.brevoFromName) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHostBr,
    port: env.smtpPortBr,
    secure: env.smtpPortBr === 465,
    auth: {
      user: env.smtpUserBr,
      pass: env.smtpPassBr,
    },
  });
}

export async function sendOtpEmail(to: string, otp: string) {
  const transport = createBrevoTransport();
  if (!transport) {
    throw new Error('Brevo email is not configured.');
  }

  await transport.sendMail({
    from: {
      name: env.brevoFromName,
      address: env.brevoFromEmail,
    },
    to,
    subject: 'Japanese Learning Portal - Email Verification Code',
    text: `Your Japanese Learning Portal verification code is:\n\n${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this code, you can ignore this email.`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transport = createBrevoTransport();
  if (!transport) {
    throw new Error('Brevo email is not configured.');
  }

  await transport.sendMail({
    from: {
      name: env.brevoFromName,
      address: env.brevoFromEmail,
    },
    to,
    subject: 'Japanese Learning Portal - Reset your password',
    text: [
      'We received a request to reset your Japanese Learning Portal password.',
      '',
      `Reset your password here: ${resetUrl}`,
      '',
      'This link expires in 30 minutes.',
      '',
      "If you did not request this password reset, you can ignore this email.",
    ].join('\n'),
  });
}

export async function sendCsvEmail(to: string, subject: string, csvContent: string) {
  const transport = createTransport();
  if (!transport) {
    throw new Error('Email is not configured. Set SMTP credentials in environment variables.');
  }

  const mailOptions = {
    from: env.emailFrom,
    to,
    subject,
    text: 'Your data export from the Japanese portal.',
    attachments: [
      {
        filename: 'my-japanese-verbs.csv',
        content: Buffer.from(csvContent, 'utf8'),
      },
    ],
  };

  await transport.sendMail(mailOptions);
}
