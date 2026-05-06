import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { requireAuth } from '@/middleware/auth';
import { errorResponse } from '@/utils/response';
import { signMemberCardToken } from '@/lib/memberCardToken';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      request.nextUrl.origin;

    const token = signMemberCardToken(String(user._id));
    const verifyUrl = `${baseUrl}/api/public/member-card?t=${encodeURIComponent(token)}`;

    const pngBuffer = await QRCode.toBuffer(verifyUrl, {
      type: 'png',
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      errorResponse('Impossible de générer le QR code'),
      { status: 500 }
    );
  }
}
