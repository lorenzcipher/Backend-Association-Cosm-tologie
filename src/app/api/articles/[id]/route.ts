import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const user = await requireAuth(request);
    const article = await Article.findById(params.id).populate('authorId', 'email');
    
    if (!article || !article.isPublished) {
      return NextResponse.json(
        errorResponse('Article not found'),
        { status: 404 }
      );
    }

    // Check member-only access
    if (article.isMemberOnly && !user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    // Increment views
    article.views += 1;
    await article.save();

    return NextResponse.json(
      successResponse(article, 'Article retrieved successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    const updateData = await request.json();
    
    const article = await Article.findByIdAndUpdate(
      params.id,
      {
        ...updateData,
        publishedAt: updateData.isPublished && !updateData.publishedAt 
          ? new Date() 
          : updateData.publishedAt
      },
      { new: true, runValidators: true }
    );

    if (!article) {
      return NextResponse.json(
        errorResponse('Article not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(article, 'Article updated successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    const article = await Article.findByIdAndDelete(params.id);
    
    if (!article) {
      return NextResponse.json(
        errorResponse('Article not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Article deleted successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}