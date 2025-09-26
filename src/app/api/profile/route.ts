import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { requireAuth } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    await connectDB();
    
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return NextResponse.json(
        errorResponse('Profile not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(profile, 'Profile retrieved successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    await connectDB();
    
    const updateData = await request.json();
    
    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return NextResponse.json(
        errorResponse('Profile not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(profile, 'Profile updated successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}