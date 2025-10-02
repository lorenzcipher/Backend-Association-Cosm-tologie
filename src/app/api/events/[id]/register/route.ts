import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

interface RouteContext {
  params: {
    id: string;
  };
}

// Get single event
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();
    const { id } = context.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'email')
      .populate('participants', 'email name');

    if (!event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(event, 'Event retrieved successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

// Update event
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = context.params;
    const updates = await request.json();

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      successResponse(updatedEvent, 'Event updated successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

// Delete event
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = context.params;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json(
      successResponse(null, 'Event deleted successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}