import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

function env(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function getMailFromAddress(): string {
  return (
    env('EMAIL_FROM') ||
    env('SMTP_FROM') ||
    env('EMAIL_USER') ||
    env('SMTP_USER') ||
    ''
  );
}

export function createMailTransporter() {
  const host = env('EMAIL_HOST') || env('SMTP_HOST');
  const port = Number(env('EMAIL_PORT') || env('SMTP_PORT') || '465');
  const user = env('EMAIL_USER') || env('SMTP_USER');
  const pass = env('EMAIL_PASS') || env('SMTP_PASS');

  if (!host || !user || !pass) {
    throw new Error(
      'Email configuration incomplete. Set EMAIL_HOST, EMAIL_USER and EMAIL_PASS on Vercel.'
    );
  }

  const secureEnv = env('EMAIL_SECURE') ?? env('SMTP_SECURE');
  const secure =
    secureEnv !== undefined ? secureEnv === 'true' : port === 465;

  const options: SMTPTransport.Options = {
    host,
    port,
    secure,
    auth: { user, pass },
    authMethod: 'LOGIN',
    tls: {
      minVersion: 'TLSv1.2',
      servername: host,
    },
  };

  if (port === 587) {
    options.secure = false;
    options.requireTLS = true;
  }

  return nodemailer.createTransport(options);
}
