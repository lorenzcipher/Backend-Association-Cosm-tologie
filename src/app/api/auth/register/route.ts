import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      professionalStatus,
      domainOfInterest
    } = body;

    // Validation
    if (!email || !password || !firstName || !lastName || !professionalStatus) {
      return NextResponse.json(
        errorResponse('Missing required fields'),
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        errorResponse('User already exists'),
        { status: 400 }
      );
    }

    // Create user
    const user = new User({
      email,
      password,
      role: 'member'
    });

    await user.save();

    // Create profile
    const profile = new Profile({
      userId: user._id,
      firstName,
      lastName,
      phone,
      professionalStatus,
      domainOfInterest: Array.isArray(domainOfInterest) ? domainOfInterest : [domainOfInterest]
    });

    await profile.save();

    return NextResponse.json(
      successResponse(
        { 
          userId: user._id,
          email: user.email,
          message: 'Registration successful. Please wait for account validation.'
        },
        'User registered successfully'
      ),
      { status: 201 }
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}