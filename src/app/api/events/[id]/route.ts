import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';


interface UpdateEventBody {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  isOnline?: boolean;
  isMemberOnly?: boolean;
  maxParticipants?: number;
  registrationRequired?: boolean;
  registrationDeadline?: Date;
  memberPrice?: number;
  nonMemberPrice?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const user = await requireAuth(request);
    
    const event = await Event.findById(id)
      .populate('createdBy', 'email name')
      .populate('participants', 'email name');

    if (!event) {
      return NextResponse.json(
        errorResponse('Événement non trouvé'),
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur peut voir l'événement
    if (event.isMemberOnly && !user) {
      return NextResponse.json(
        errorResponse('Accès refusé - événement réservé aux membres'),
        { status: 403 }
      );
    }

    return NextResponse.json(
      successResponse(event, 'Événement récupéré avec succès')
    );
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Accès administrateur requis'),
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;
    const updates: UpdateEventBody = await request.json();
    
    // Validation des données
    if (updates.startDate && updates.endDate && updates.startDate > updates.endDate) {
      return NextResponse.json(
        errorResponse('La date de début ne peut pas être postérieure à la date de fin'),
        { status: 400 }
      );
    }

    if (updates.maxParticipants && updates.maxParticipants < 0) {
      return NextResponse.json(
        errorResponse('Le nombre maximum de participants ne peut pas être négatif'),
        { status: 400 }
      );
    }

    if (updates.memberPrice && updates.memberPrice < 0) {
      return NextResponse.json(
        errorResponse('Le prix membre ne peut pas être négatif'),
        { status: 400 }
      );
    }

    if (updates.nonMemberPrice && updates.nonMemberPrice < 0) {
      return NextResponse.json(
        errorResponse('Le prix non-membre ne peut pas être négatif'),
        { status: 400 }
      );
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('createdBy', 'email name')
     .populate('participants', 'email name');

    if (!event) {
      return NextResponse.json(
        errorResponse('Événement non trouvé'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(event, 'Événement mis à jour avec succès')
    );
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Accès administrateur requis'),
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;
    
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json(
        errorResponse('Événement non trouvé'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Événement supprimé avec succès')
    );
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
