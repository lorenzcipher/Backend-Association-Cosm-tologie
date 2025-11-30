import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import { successResponse, errorResponse, handleApiError } from '@/utils/response';

interface UpdateEventBody {
  title?: string;
  description?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  location?: string;
  isOnline?: boolean;
  isMemberOnly?: boolean;
  maxParticipants?: number;
  registrationRequired?: boolean;
  registrationDeadline?: Date | string;
  memberPrice?: number;
  nonMemberPrice?: number;
  category?: string;
  imgUrl?: string;
}

async function resolveParams(params: any) {
  if (!params) return null;
  if (typeof params.then === 'function') return await params;
  return params;
}

export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    await connectDB();
    const resolved = await resolveParams(params);
    const id = resolved?.id;

    const user = await requireAuth(request).catch(() => null);

    const event = await Event.findById(id)
      .populate('createdBy', 'email name')
      .populate('participants', 'email name');

    if (!event) return NextResponse.json(errorResponse('Événement non trouvé'), { status: 404 });
    if (event.isMemberOnly && !user) return NextResponse.json(errorResponse("Accès refusé - événement réservé aux membres"), { status: 403 });

    return NextResponse.json(successResponse(event, 'Événement récupéré avec succès'));
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function PUT(request: NextRequest, { params }: { params: any }) {
  try {
    const user = await requireAdmin(request);
    if (!user) return NextResponse.json(errorResponse('Accès administrateur requis'), { status: 403 });

    await connectDB();
    const resolved = await resolveParams(params);
    const id = resolved?.id;
    const updates: UpdateEventBody = await request.json();

    if (updates.startDate && updates.endDate && new Date(updates.startDate) > new Date(updates.endDate)) {
      return NextResponse.json(errorResponse('La date de début ne peut pas être postérieure à la date de fin'), { status: 400 });
    }

    if (updates.maxParticipants && updates.maxParticipants < 0) return NextResponse.json(errorResponse('Le nombre maximum de participants ne peut pas être négatif'), { status: 400 });
    if (updates.memberPrice && updates.memberPrice < 0) return NextResponse.json(errorResponse('Le prix membre ne peut pas être négatif'), { status: 400 });
    if (updates.nonMemberPrice && updates.nonMemberPrice < 0) return NextResponse.json(errorResponse('Le prix non-membre ne peut pas être négatif'), { status: 400 });

    const event = await Event.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
      .populate('createdBy', 'email name')
      .populate('participants', 'email name');

    if (!event) return NextResponse.json(errorResponse('Événement non trouvé'), { status: 404 });
    return NextResponse.json(successResponse(event, 'Événement mis à jour avec succès'));
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: any }) {
  try {
    const user = await requireAdmin(request);
    if (!user) return NextResponse.json(errorResponse('Accès administrateur requis'), { status: 403 });

    await connectDB();
    const resolved = await resolveParams(params);
    const id = resolved?.id;

    const event = await Event.findByIdAndDelete(id);
    if (!event) return NextResponse.json(errorResponse('Événement non trouvé'), { status: 404 });
    return NextResponse.json(successResponse(null, 'Événement supprimé avec succès'));
  } catch (error) {
    const { status, response } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export const dynamic = 'force-dynamic';
