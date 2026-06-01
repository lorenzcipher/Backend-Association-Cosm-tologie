import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { sendViaBrevoApi, type EmailAttachment, type SendEmailInput } from '@/lib/brevoApi';

export type MailMode = 'relay' | 'direct' | 'brevo-api';

export type { EmailAttachment, SendEmailInput };

const RELAY_PRESETS: Record<
  string,
  { host: string; port: number; defaultUser?: string }
> = {
  brevo: { host: 'smtp-relay.brevo.com', port: 587 },
  sendgrid: { host: 'smtp.sendgrid.net', port: 587, defaultUser: 'apikey' },
  resend: { host: 'smtp.resend.com', port: 587, defaultUser: 'resend' },
  mailgun: { host: 'smtp.mailgun.org', port: 587 },
};

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

export function getBrevoApiKey(): string | undefined {
  return env('BREVO_API_KEY');
}

export function shouldUseBrevoApi(): boolean {
  return Boolean(getBrevoApiKey());
}

export function getMailMode(): MailMode {
  if (shouldUseBrevoApi()) {
    return 'brevo-api';
  }
  if (env('EMAIL_USE_RELAY') === 'true' || env('SMTP_RELAY_HOST')) {
    return 'relay';
  }
  return 'direct';
}

function getRelaySettings() {
  const provider = env('SMTP_RELAY_PROVIDER')?.toLowerCase();
  const preset = provider ? RELAY_PRESETS[provider] : undefined;

  const host = env('SMTP_RELAY_HOST') || preset?.host;
  const port = Number(env('SMTP_RELAY_PORT') || preset?.port || '587');
  const user =
    env('SMTP_RELAY_USER') || preset?.defaultUser;
  const pass = env('SMTP_RELAY_PASS');

  return { host, port, user, pass, provider: provider || (host ? 'custom' : null) };
}

function getDirectSettings(portOverride?: number) {
  const host = env('EMAIL_HOST') || env('SMTP_HOST');
  const port =
    portOverride ?? Number(env('EMAIL_PORT') || env('SMTP_PORT') || '465');
  const user = env('EMAIL_USER') || env('SMTP_USER');
  const pass = env('EMAIL_PASS') || env('SMTP_PASS');

  return { host, port, user, pass, provider: null };
}

export function getMailConfigSummary() {
  const mode = getMailMode();

  if (mode === 'brevo-api') {
    return {
      mode,
      provider: 'brevo',
      apiKeyConfigured: Boolean(getBrevoApiKey()),
      from: getMailFromAddress() || null,
    };
  }

  if (mode === 'relay') {
    const relay = getRelaySettings();
    return {
      mode,
      provider: relay.provider,
      host: relay.host || null,
      port: relay.port,
      user: relay.user || null,
      passConfigured: Boolean(relay.pass),
      from: getMailFromAddress() || null,
    };
  }

  const direct = getDirectSettings();
  return {
    mode,
    provider: null,
    host: direct.host || null,
    port: direct.port,
    user: direct.user || null,
    passConfigured: Boolean(direct.pass),
    from: getMailFromAddress() || null,
  };
}

export function getMailFromAddress(): string {
  if (getMailMode() === 'relay') {
    return (
      env('SMTP_RELAY_FROM') ||
      env('EMAIL_FROM') ||
      env('SMTP_FROM') ||
      env('SMTP_RELAY_USER') ||
      ''
    );
  }

  return (
    env('EMAIL_FROM') ||
    env('SMTP_FROM') ||
    env('EMAIL_USER') ||
    env('SMTP_USER') ||
    ''
  );
}

function buildTransportOptions(
  settings: ReturnType<typeof getRelaySettings>
): SMTPTransport.Options {
  const { host, port, user, pass } = settings;

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP relay configuration incomplete. Set SMTP_RELAY_HOST, SMTP_RELAY_USER, SMTP_RELAY_PASS (or SMTP_RELAY_PROVIDER + credentials).'
    );
  }

  const secureEnv = env('SMTP_RELAY_SECURE') ?? env('EMAIL_SECURE') ?? env('SMTP_SECURE');
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
  if (getMailMode() === 'relay') {
    const relay = getRelaySettings();
    if (portOverride) relay.port = portOverride;
    return nodemailer.createTransport(buildTransportOptions(relay));
  }

  const direct = getDirectSettings(portOverride);
  if (!direct.host || !direct.user || !direct.pass) {
    throw new Error(
      'Email configuration incomplete. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS — or enable relay with EMAIL_USE_RELAY=true.'
    );
  }

  const secureEnv = env('EMAIL_SECURE') ?? env('SMTP_SECURE');
  const secure =
    secureEnv !== undefined ? secureEnv === 'true' : direct.port === 465;

  const options: SMTPTransport.Options = {
    host: direct.host,
    port: direct.port,
    secure,
    auth: { user: direct.user, pass: direct.pass },
    tls: {
      minVersion: 'TLSv1.2',
      servername: direct.host,
    },
    connectionTimeout: 30_000,
    greetingTimeout: 30_000,
    socketTimeout: 60_000,
  };

  if (direct.port === 587) {
    options.secure = false;
    options.requireTLS = true;
  }

  return nodemailer.createTransport(options);
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
    message.includes('Unauthorized IP') ||
    details.responseCode === 525 ||
    details.responseCode === 535 ||
    details.responseCode === 530
  );
}

export function isBrevoIpBlockedError(error: unknown): boolean {
  const details = getSmtpErrorDetails(error);
  return (
    details.responseCode === 525 ||
    (details.message || '').includes('Unauthorized IP')
  );
}

export async function sendEmail(input: SendEmailInput) {
  const apiKey = getBrevoApiKey();
  if (apiKey) {
    return sendViaBrevoApi(input, apiKey);
  }

  return sendMailWithFallback(input);
}

export async function sendMailWithFallback(input: SendEmailInput) {
  const mailOptions = {
    from: input.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    attachments: input.attachments,
  };

  const mode = getMailMode();

  if (mode === 'relay') {
    const relay = getRelaySettings();
    const transporter = createMailTransporter(relay.port);
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    return { mode: 'relay' as const, port: relay.port, provider: relay.provider };
  }

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
      return { mode: 'direct' as const, port, provider: null };
    } catch (error) {
      lastError = error;
      console.error(`SMTP attempt failed on port ${port}:`, getSmtpErrorDetails(error));
    }
  }

  throw lastError;
}
