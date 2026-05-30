import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { createMailTransporter } from '@/lib/mail';
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

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.SMTP_USER,
      to,
      subject: subject || 'No subject',
      html: body?.replace(/\n/g, '<br>') || '',
      attachments,
    });

    return NextResponse.json(
      successResponse(null, 'Email sent successfully')
    );
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
