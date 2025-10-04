import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { requireAuth } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Authentification requise'),
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        errorResponse('Événement non trouvé'),
        { status: 404 }
      );
    }

    // Vérifier si l'événement nécessite une inscription
    if (!event.registrationRequired) {
      return NextResponse.json(
        errorResponse('Cet événement ne nécessite pas d\'inscription'),
        { status: 400 }
      );
    }

    // Vérifier si l'événement est réservé aux membres
    if (event.isMemberOnly && !user.isMember) {
      return NextResponse.json(
        errorResponse('Cet événement est réservé aux membres'),
        { status: 403 }
      );
    }

    // Vérifier la date limite d'inscription
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return NextResponse.json(
        errorResponse('La date limite d\'inscription est dépassée'),
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur est déjà inscrit
    if (event.participants.includes(user._id)) {
      return NextResponse.json(
        errorResponse('Vous êtes déjà inscrit à cet événement'),
        { status: 400 }
      );
    }

    // Vérifier le nombre maximum de participants
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return NextResponse.json(
        errorResponse('Le nombre maximum de participants est atteint'),
        { status: 400 }
      );
    }

    // Ajouter l'utilisateur à la liste des participants
    event.participants.push(user._id);
    await event.save();

    // Populer les données pour la réponse
    await event.populate('participants', 'email name');

    return NextResponse.json(
      successResponse(event, 'Inscription à l\'événement réussie'),
      { status: 201 }
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
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        errorResponse('Authentification requise'),
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        errorResponse('Événement non trouvé'),
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur est inscrit
    if (!event.participants.includes(user._id)) {
      return NextResponse.json(
        errorResponse('Vous n\'êtes pas inscrit à cet événement'),
        { status: 400 }
      );
    }

    // Retirer l'utilisateur de la liste des participants
    event.participants.pull(user._id);
    await event.save();

    // Populer les données pour la réponse
    await event.populate('participants', 'email name');

    return NextResponse.json(
      successResponse(event, 'Désinscription de l\'événement réussie')
    );
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}