import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Media from '@/models/Media';
import { requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const media = await Media.findById(id);
    if (!media) return NextResponse.json(errorResponse('Media not found'), { status: 404 });

    return NextResponse.json(successResponse(media, 'Media retrieved successfully'));
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
    const user = await requireAdmin(request);
    if (!user) return NextResponse.json(errorResponse('Admin access required'), { status: 403 });

    await connectDB();
    const body = await request.json() as {
      title?: string;
      description?: string;
      imgURL?: string;
      thumbnailUrl?: string;
      isMemberOnly?: boolean | string;
      tags?: string[];
      category?: string;
    };

    type UpdateFields = {
      title?: string;
      description?: string;
      fileUrl?: string;
      thumbnailUrl?: string;
      isMemberOnly?: boolean | string;
      tags?: string[];
      category?: string;
    };

    const update: Partial<UpdateFields> = {};
    if (body.title) update.title = body.title;
    if (body.description) update.description = body.description;
    if (body.imgURL) update.fileUrl = body.imgURL;
    if (body.thumbnailUrl) update.thumbnailUrl = body.thumbnailUrl;
    if (typeof body.isMemberOnly !== 'undefined') update.isMemberOnly = body.isMemberOnly;
    if (body.tags) update.tags = body.tags;
    if (body.category) update.category = body.category;

    const media = await Media.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!media) return NextResponse.json(errorResponse('Media not found'), { status: 404 });

    return NextResponse.json(successResponse(media, 'Media updated successfully'));
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
    const user = await requireAdmin(request);
    if (!user) return NextResponse.json(errorResponse('Admin access required'), { status: 403 });

    await connectDB();
    const media = await Media.findByIdAndDelete(id);
    if (!media) return NextResponse.json(errorResponse('Media not found'), { status: 404 });

    return NextResponse.json(successResponse(null, 'Media deleted successfully'));
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
