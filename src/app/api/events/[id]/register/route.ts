import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { requireAuth } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    await connectDB();
    
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    // Check if registration is required
    if (!event.registrationRequired) {
      return NextResponse.json(
        errorResponse('This event does not require registration'),
        { status: 400 }
      );
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return NextResponse.json(
        errorResponse('Registration deadline has passed'),
        { status: 400 }
      );
    }

    // Check if user is already registered
    if (event.participants.includes(user._id)) {
      return NextResponse.json(
        errorResponse('Already registered for this event'),
        { status: 400 }
      );
    }

    // Check maximum participants
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return NextResponse.json(
        errorResponse('Event is full'),
        { status: 400 }
      );
    }

    // Add user to participants
    event.participants.push(user._id);
    await event.save();

    return NextResponse.json(
      successResponse(null, 'Successfully registered for the event')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    await connectDB();
    
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      (participantId: mongoose.Types.ObjectId) => !participantId.equals(user._id)
    );
    
    await event.save();

    return NextResponse.json(
      successResponse(null, 'Successfully unregistered from the event')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}