import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json() as { userId?: string };
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        errorResponse('userId is required'),
        { status: 400 }
      );
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: userId },
      {
        status: 'active',
        payed: true
      },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return NextResponse.json(
        errorResponse('Profile not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(profile, 'Profile activated successfully'),
      { status: 200 }
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
