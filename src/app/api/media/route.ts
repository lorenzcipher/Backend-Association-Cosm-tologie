import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Media from '@/models/Media';
import { requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;
    const memberOnly = searchParams.get('memberOnly');

    const query: Record<string, any> = {};
    if (category) query.category = category;
    if (memberOnly === 'true') query.isMemberOnly = true;
    if (memberOnly === 'false') query.isMemberOnly = false;

    const skip = (page - 1) * limit;

    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Media.countDocuments(query);

    return NextResponse.json(
      successResponse({ media, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }, 'Media retrieved successfully')
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
      return NextResponse.json(errorResponse('Admin access required'), { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { title, imgURL, description, category, isMemberOnly } = body;

    if (!title || !imgURL) {
      return NextResponse.json(errorResponse('Title and imgURL are required'), { status: 400 });
    }

    const media = await Media.create({
      title,
      description: description || '',
      fileUrl: imgURL,
      fileType: 'image',
      thumbnailUrl: imgURL,
      isMemberOnly: !!isMemberOnly,
      uploadedBy: user._id,
      tags: category ? [category] : [],
      category: category || undefined
    });

    return NextResponse.json(successResponse(media, 'Media created successfully'), { status: 201 });
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

// Note: multipart uploads (file storage) are not implemented here — the API expects an `imgURL`.
