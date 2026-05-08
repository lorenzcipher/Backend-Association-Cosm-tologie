import { NextRequest, NextResponse } from 'next/server';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import QRCode from 'qrcode';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import { requireAuth } from '@/middleware/auth';
import { errorResponse, handleApiError } from '@/utils/response';

// Next.js 15: params must be a Promise
interface RouteContext {
  params: Promise<{ id: string }>;
}

function getQrSecret(): Secret {
  const secret = process.env.QR_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing QR_SECRET (or JWT_SECRET) env var');
  }
  return secret as Secret;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const requester = await requireAuth(request);
    if (!requester) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const isSelf = requester._id?.toString?.() === id;
    const isAdmin = requester.role === 'admin';
    if (!isAdmin && !isSelf) {
      return NextResponse.json(errorResponse('Forbidden'), { status: 403 });
    }

    await connectDB();

    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json(errorResponse('User not found'), { status: 404 });
    }

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return NextResponse.json(errorResponse('Profile not found'), { status: 404 });
    }

    const origin = request.nextUrl.origin;
    const signOptions: SignOptions = { algorithm: 'HS256', expiresIn: '30d' };
    const token = jwt.sign(
      { t: 'user-qr', uid: user._id.toString() },
      getQrSecret(),
      signOptions
    );

    const qrUrl = `${origin}/qr/${encodeURIComponent(token)}`;
    const pngBuffer = await QRCode.toBuffer(qrUrl, {
      type: 'png',
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'M',
    });

    // NextResponse body typing can be strict; ensure it's a Uint8Array.
    const body = new Uint8Array(pngBuffer);
    return new NextResponse(body, {
      status: 200,
      headers: {
        'content-type': 'image/png',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

