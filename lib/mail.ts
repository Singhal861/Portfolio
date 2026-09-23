import nodemailer from 'nodemailer';
import { env } from './env';

export function createTransport() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
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
