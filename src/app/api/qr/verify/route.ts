import { NextRequest, NextResponse } from 'next/server';
import jwt, { Secret } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

function getQrSecret(): Secret {
  const secret = process.env.QR_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing QR_SECRET (or JWT_SECRET) env var');
  }
  return secret as Secret;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json(errorResponse('Missing token'), { status: 400 });
    }

    let decoded: unknown;
    try {
      decoded = jwt.verify(token, getQrSecret());
    } catch {
      return NextResponse.json(errorResponse('Invalid or expired token'), { status: 401 });
    }

    const payload = decoded as { t?: string; uid?: string };
    if (payload?.t !== 'user-qr' || !payload?.uid) {
      return NextResponse.json(errorResponse('Invalid token payload'), { status: 401 });
    }

    await connectDB();

    const user = await User.findById(payload.uid).select('-password');
    if (!user) {
      return NextResponse.json(errorResponse('User not found'), { status: 404 });
    }

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return NextResponse.json(errorResponse('Profile not found'), { status: 404 });
    }

    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    const isActive = Boolean(user.isActive);
    const hasPaidSubscription = Boolean(profile.payed);

    return NextResponse.json(
      successResponse(
        {
          userId: user._id.toString(),
          name: fullName,
          isActive,
          subscriptionPaid: hasPaidSubscription,
        },
        'QR status verified'
      )
    );
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

