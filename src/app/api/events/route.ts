import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

interface CreateEventBody {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
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