import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import {
  getMailConfigSummary,
  getMailFromAddress,
  getSmtpErrorDetails,
  isSmtpAuthError,
  sendMailWithFallback,
} from '@/lib/mail';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const to = formData.get('to') as string | null;
    const subject = formData.get('subject') as string | null;
    const body = formData.get('body') as string | null;
    const file = formData.get('attachment') as File | null;

    if (!to) {
      return NextResponse.json(
        errorResponse('Recipient is required'),
        { status: 400 }
      );
    }

    const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer,
        contentType: file.type || 'application/octet-stream',
      });
    }

    const from = getMailFromAddress();
    if (!from) {
      return NextResponse.json(
        errorResponse('EMAIL_FROM or EMAIL_USER must be configured'),
        { status: 500 }
      );
    }

    const { port } = await sendMailWithFallback({
      from,
      to,
      subject: subject || 'No subject',
      html: body?.replace(/\n/g, '<br>') || '',
      attachments,
    });

    return NextResponse.json(
      successResponse({ smtpPort: port }, 'Email sent successfully')
    );
  } catch (error) {
    const smtpDetails = getSmtpErrorDetails(error);
    const config = getMailConfigSummary();

    if (isSmtpAuthError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Error',
          error:
            'SMTP authentication failed. Check EMAIL_USER, EMAIL_PASS and EMAIL_FROM on Vercel (no quotes). Try EMAIL_PORT=587 and EMAIL_FALLBACK_PORT=587.',
          data: {
            config,
            smtp: smtpDetails,
          },
        },
        { status: 502 }
      );
    }

    console.error('Email send failed:', { config, smtpDetails });

    const { status, response } = handleApiError(error);
    return NextResponse.json(
      {
        ...response,
        data: {
          config,
          smtp: smtpDetails,
        },
      },
      { status }
    );
  }
}
