import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { verifyToken, extractTokenFromHeader, requireAuth, requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

interface CreateEventBody {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type?: string;
  image?: string; // URL
  location: string;
  isOnline: boolean;
  isMemberOnly: boolean;
  maxParticipants: number;
  registrationRequired: boolean;
  registrationDeadline: Date;
  participants: string[];
  memberPrice: number;
  nonMemberPrice: number;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const upcoming = searchParams.get('upcoming') === 'true';
    
    const user = await requireAuth(request);
    
    // Build query
    const query: Record<string, unknown> = {};
    
    if (upcoming) {
      query.startDate = { $gte: new Date() };
    }
    
    if (!user) {
      query.isMemberOnly = false;
    }

    const skip = (page - 1) * limit;
    
    const events = await Event.find(query)
      .populate('createdBy', 'email')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    return NextResponse.json(
      successResponse({
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, 'Events retrieved successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      );
    }

    const body: CreateEventBody = await request.json();
    
    const event = await Event.create({
      ...body,
      memberPrice: body.memberPrice || 0,
      nonMemberPrice: body.nonMemberPrice || 0,
      createdBy: user._id
    });

    return NextResponse.json(
      successResponse(event, 'Event created successfully'),
      { status: 201 }
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

// DELETE endpoint
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
  await connectDB();
  const token = extractTokenFromHeader(request);
  const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== "admin") {
      return NextResponse.json(errorResponse('Not authorized'), { status: 403 });
    }

    const event = await Event.findByIdAndDelete(params.id);
    if (!event) {
      return NextResponse.json(errorResponse('Event not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(null, 'Event deleted successfully'));
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

// PUT endpoint for updating events
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
  await connectDB();
  const token = extractTokenFromHeader(request);
  const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== "admin") {
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

    const event = await Event.findByIdAndUpdate(
      params.id,
      { $set: update },
      { new: true }
    );

    if (!event) {
      return NextResponse.json(errorResponse('Event not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(event, 'Event updated successfully'));
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}