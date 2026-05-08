import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        errorResponse('Category not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(category, 'Category retrieved successfully')
    );

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
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      );
    }

    await connectDB();

    const updateData = await request.json();
    const { id } = await context.params;

    // Validation
    if (updateData.name === '' || updateData.description === '') {
      return NextResponse.json(
        errorResponse('Name and description cannot be empty'),
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        errorResponse('Category not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(category, 'Category updated successfully')
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
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await context.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        errorResponse('Category not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Category deleted successfully')
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

