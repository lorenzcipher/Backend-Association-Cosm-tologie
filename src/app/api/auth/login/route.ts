import { NextRequest, NextResponse } from 'next/server';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import QRCode from 'qrcode';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';
import { signMemberCardToken } from '@/lib/memberCardToken';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        errorResponse('Email and password are required'),
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        errorResponse('Invalid credentials'),
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        errorResponse('Invalid credentials'),
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        errorResponse('Account is deactivated'),
        { status: 401 }
      );
    }

    // Ensure JWT_SECRET exists and properly type it
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return NextResponse.json(
        errorResponse('Server configuration error'),
        { status: 500 }
      );
    }

    // Prepare JWT payload
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    // Prepare JWT options with proper typing
    const signOptions: SignOptions = {
      algorithm: 'HS256'
    };

    // Generate JWT token with explicit typing
    const token = jwt.sign(
      payload,
      jwtSecret as Secret,
      signOptions
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      request.nextUrl.origin;
    const memberCardToken = signMemberCardToken(user._id.toString());
    const memberCardUrl = `${baseUrl}/api/public/member-card?t=${encodeURIComponent(memberCardToken)}`;
    const qrPngDataUrl = await QRCode.toDataURL(memberCardUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M'
    });

    return NextResponse.json(
      successResponse({
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        memberCard: {
          token: memberCardToken,
          url: memberCardUrl,
          qrPngDataUrl
        }
      }, 'Login successful')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}