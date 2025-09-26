import { NextRequest, NextResponse } from 'next/server';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

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

    return NextResponse.json(
      successResponse({
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }, 'Login successful')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}