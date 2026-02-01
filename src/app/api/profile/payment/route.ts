import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { requireAuth } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json() as { orderId?: string };
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        errorResponse('orderId is required'),
        { status: 400 }
      );
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      {
        status: 'active',
        payed: true,
        orderId: orderId
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
      successResponse(profile, 'Payment status updated successfully'),
      { status: 200 }
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
