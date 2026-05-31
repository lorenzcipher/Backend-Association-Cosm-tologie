import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { Options as MailOptions } from 'nodemailer/lib/mailer';

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

export function getMailConfigSummary() {
  const host = env('EMAIL_HOST') || env('SMTP_HOST');
  const port = Number(env('EMAIL_PORT') || env('SMTP_PORT') || '465');
  const user = env('EMAIL_USER') || env('SMTP_USER');
  const pass = env('EMAIL_PASS') || env('SMTP_PASS');

  return {
    host: host || null,
    port,
    user: user || null,
    passConfigured: Boolean(pass),
    from: getMailFromAddress() || null,
  };
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

function buildTransportOptions(port: number): SMTPTransport.Options {
  const host = env('EMAIL_HOST') || env('SMTP_HOST');
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
    tls: {
      minVersion: 'TLSv1.2',
      servername: host,
    },
    connectionTimeout: 30_000,
    greetingTimeout: 30_000,
    socketTimeout: 60_000,
  };

  if (port === 587) {
    options.secure = false;
    options.requireTLS = true;
  }

  return options;
}

export function createMailTransporter(portOverride?: number) {
  const port = portOverride ?? Number(env('EMAIL_PORT') || env('SMTP_PORT') || '465');
  return nodemailer.createTransport(buildTransportOptions(port));
}

export function getSmtpErrorDetails(error: unknown) {
  if (!error || typeof error !== 'object') {
    return { message: 'Unknown SMTP error' };
  }

  const err = error as {
    message?: string;
    code?: string;
    response?: string;
    responseCode?: number;
    command?: string;
  };

  return {
    message: err.message,
    code: err.code,
    response: err.response,
    responseCode: err.responseCode,
    command: err.command,
  };
}

export function isSmtpAuthError(error: unknown): boolean {
  const details = getSmtpErrorDetails(error);
  const message = details.message || '';
  return (
    details.code === 'EAUTH' ||
    message.includes('SMTP AUTH') ||
    message.includes('Authentication') ||
    details.responseCode === 535 ||
    details.responseCode === 530
  );
}

export async function sendMailWithFallback(mailOptions: MailOptions) {
  const primaryPort = Number(env('EMAIL_PORT') || env('SMTP_PORT') || '465');
  const fallbackPort = Number(env('EMAIL_FALLBACK_PORT') || '587');

  const attempts = [primaryPort];
  if (fallbackPort && fallbackPort !== primaryPort) {
    attempts.push(fallbackPort);
  }

  let lastError: unknown;

  for (const port of attempts) {
    const transporter = createMailTransporter(port);
    try {
      await transporter.verify();
      await transporter.sendMail(mailOptions);
      return { port };
    } catch (error) {
      lastError = error;
      console.error(`SMTP attempt failed on port ${port}:`, getSmtpErrorDetails(error));
    }
  }

  throw lastError;
}
