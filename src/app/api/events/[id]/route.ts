import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { verifyToken, extractTokenFromHeader } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const event = await Event.findById(id).populate('createdBy', 'email');
    if (!event) return NextResponse.json(errorResponse('Event not found'), { status: 404 });

    return NextResponse.json(successResponse(event, 'Event retrieved successfully'));
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();
    const token = extractTokenFromHeader(request);
    const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== 'admin') {
      return NextResponse.json(errorResponse('Not authorized'), { status: 403 });
    }

    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (body.title) update.title = body.title;
    if (body.description) update.description = body.description;
    if (body.startDate) update.startDate = body.startDate;
    if (body.endDate) update.endDate = body.endDate;
    if (typeof body.location !== 'undefined') update.location = body.location;
    if (typeof body.isOnline !== 'undefined') update.isOnline = body.isOnline;
    if (typeof body.isMemberOnly !== 'undefined') update.isMemberOnly = body.isMemberOnly;
    if (typeof body.maxParticipants !== 'undefined') update.maxParticipants = body.maxParticipants;
    if (typeof body.registrationRequired !== 'undefined') update.registrationRequired = body.registrationRequired;
    if (body.registrationDeadline) update.registrationDeadline = body.registrationDeadline;
    if (typeof body.memberPrice !== 'undefined') update.memberPrice = body.memberPrice;
    if (typeof body.nonMemberPrice !== 'undefined') update.nonMemberPrice = body.nonMemberPrice;
    if (body.type) update.type = body.type;
    if (body.image) update.image = body.image;

    const event = await Event.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!event) return NextResponse.json(errorResponse('Event not found'), { status: 404 });

    return NextResponse.json(successResponse(event, 'Event updated successfully'));
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();
    const token = extractTokenFromHeader(request);
    const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== 'admin') {
      return NextResponse.json(errorResponse('Not authorized'), { status: 403 });
    }

    const event = await Event.findByIdAndDelete(id);
    if (!event) return NextResponse.json(errorResponse('Event not found'), { status: 404 });

    return NextResponse.json(successResponse(null, 'Event deleted successfully'));
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
