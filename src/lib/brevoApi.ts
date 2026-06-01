export type EmailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

export type SendEmailInput = {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

function parseFromAddress(from: string): { email: string; name?: string } {
  const withName = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (withName) {
    return { name: withName[1].trim(), email: withName[2].trim() };
  }
  return { email: from.trim() };
}

export async function sendViaBrevoApi(
  input: SendEmailInput,
  apiKey: string
): Promise<{ mode: 'brevo-api'; messageId?: string }> {
  const sender = parseFromAddress(input.from);

  const payload: Record<string, unknown> = {
    sender,
    to: [{ email: input.to }],
    subject: input.subject,
    htmlContent: input.html,
  };

  if (input.attachments?.length) {
    payload.attachment = input.attachments.map((file) => ({
      name: file.filename,
      content: file.content.toString('base64'),
    }));
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as {
    messageId?: string;
    message?: string;
    code?: string;
  };

  if (!response.ok) {
    const detail = data.message || response.statusText;
    throw new Error(`Brevo API error (${response.status}): ${detail}`);
  }

  return { mode: 'brevo-api', messageId: data.messageId };
}
