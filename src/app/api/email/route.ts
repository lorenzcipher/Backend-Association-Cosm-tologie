import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { createMailTransporter, getMailFromAddress } from '@/lib/mail';
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

    const transporter = createMailTransporter();
    await transporter.verify();

    const from = getMailFromAddress();
    if (!from) {
      return NextResponse.json(
        errorResponse('EMAIL_FROM or EMAIL_USER must be configured'),
        { status: 500 }
      );
    }

    await transporter.sendMail({
      from,
      to,
      subject: subject || 'No subject',
      html: body?.replace(/\n/g, '<br>') || '',
      attachments,
    });

    return NextResponse.json(
      successResponse(null, 'Email sent successfully')
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (
      message.includes('SMTP AUTH') ||
      (error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === 'EAUTH')
    ) {
      return NextResponse.json(
        errorResponse(
          'SMTP authentication failed. Verify EMAIL_USER, EMAIL_PASS and EMAIL_FROM on Vercel (no quotes around password).'
        ),
        { status: 502 }
      );
    }

    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
