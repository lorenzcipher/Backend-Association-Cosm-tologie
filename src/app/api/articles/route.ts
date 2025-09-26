import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const memberOnly = searchParams.get('memberOnly') === 'true';
    
    const user = await requireAuth(request);
    
    // Build query
    const query: any = { isPublished: true };
    
    if (memberOnly) {
      // Member-only articles require authentication
      if (!user) {
        return NextResponse.json(
          errorResponse('Authentication required for member-only content'),
          { status: 401 }
        );
      }
      query.isMemberOnly = true;
    } else if (!user) {
      // Public articles only for non-authenticated users
      query.isMemberOnly = false;
    }

    const skip = (page - 1) * limit;
    
    const articles = await Article.find(query)
      .populate('authorId', 'email')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments(query);

    return NextResponse.json(
      successResponse({
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, 'Articles retrieved successfully')
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

    await connectDB();
    
    const articleData = await request.json();
    
    const article = new Article({
      ...articleData,
      authorId: user._id,
      publishedAt: articleData.isPublished ? new Date() : undefined
    });

    await article.save();

    return NextResponse.json(
      successResponse(article, 'Article created successfully'),
      { status: 201 }
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}