import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactForm from '@/models/ContactForm';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        errorResponse('All fields are required'),
        { status: 400 }
      );
    }

    const contactForm = new ContactForm({
      name,
      email,
      subject,
      message
    });

    await contactForm.save();

    return NextResponse.json(
      successResponse(
        { id: contactForm._id },
        'Message sent successfully'
      ),
      { status: 201 }
    );

  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}