import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import { requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

// Updated type for Next.js 15 - params must be a Promise
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  // Await the params promise
  const { id } = await context.params;

  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      );
    }

    await connectDB();

    const updateData = await request.json();

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(user, 'User updated successfully')
    );
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  // Await the params promise
  const { id } = await context.params;

  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      );
    }

    await connectDB();

    // Delete user and profile
    const user = await User.findByIdAndDelete(id);
    if (user) {
      await Profile.findOneAndDelete({ userId: id });
    }

    if (!user) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'User deleted successfully')
    );
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}