import nodemailer from 'nodemailer';

export function createMailTransporter() {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 465);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('Email configuration is incomplete');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}
