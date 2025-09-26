import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Profile from '@/models/Profile';
import { requireAuth } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'received' or 'sent'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};
    if (type === 'received') {
      query.receiverId = user._id;
    } else if (type === 'sent') {
      query.senderId = user._id;
    } else {
      query.$or = [
        { receiverId: user._id },
        { senderId: user._id }
      ];
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find(query)
      .populate('senderId', 'email')
      .populate('receiverId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(query);

    return NextResponse.json(
      successResponse({
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, 'Messages retrieved successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    await connectDB();
    
    const { receiverId, subject, content } = await request.json();

    if (!receiverId || !subject || !content) {
      return NextResponse.json(
        errorResponse('All fields are required'),
        { status: 400 }
      );
    }

    // Check if receiver exists and is a member
    const receiverProfile = await Profile.findOne({ userId: receiverId });
    if (!receiverProfile) {
      return NextResponse.json(
        errorResponse('Receiver not found'),
        { status: 404 }
      );
    }

    const message = new Message({
      senderId: user._id,
      receiverId,
      subject,
      content
    });

    await message.save();

    return NextResponse.json(
      successResponse(message, 'Message sent successfully'),
      { status: 201 }
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}