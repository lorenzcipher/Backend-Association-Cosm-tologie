import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import { successResponse, errorResponse } from '@/utils/response';
import { verifyMemberCardToken } from '@/lib/memberCardToken';

function subscriptionPaid(
  membershipStatus: string,
  membershipExpiryDate?: Date | null
): boolean {
  if (membershipStatus !== 'active') {
    return false;
  }
  if (!membershipExpiryDate) {
    return true;
  }
  return new Date(membershipExpiryDate) >= new Date(new Date().toDateString());
}

function buildHtml(data: {
  fullName: string;
  isActive: boolean;
  subscriptionPaid: boolean;
  membershipStatus: string;
}) {
  const activeLabel = data.isActive ? 'Oui' : 'Non';
  const paidLabel = data.subscriptionPaid ? 'Oui' : 'Non';
  const activeClass = data.isActive ? 'ok' : 'no';
  const paidClass = data.subscriptionPaid ? 'ok' : 'no';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Carte membre — Cosmeto</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1.25rem; background: #f4f4f5; color: #18181b; }
    .card { max-width: 22rem; margin: 0 auto; background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    h1 { font-size: 1.1rem; margin: 0 0 1rem; font-weight: 600; color: #52525b; }
    .name { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.25rem; line-height: 1.3; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; border-top: 1px solid #e4e4e7; font-size: 0.95rem; }
    .row:first-of-type { border-top: none; }
    .label { color: #71717a; }
    .ok { color: #15803d; font-weight: 600; }
    .no { color: #b91c1c; font-weight: 600; }
    .sub { font-size: 0.8rem; color: #a1a1aa; margin-top: 1rem; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Vérification membre</h1>
    <div class="name">${escapeHtml(data.fullName)}</div>
    <div class="row"><span class="label">Compte actif</span><span class="${activeClass}">${activeLabel}</span></div>
    <div class="row"><span class="label">Cotisation / abonnement à jour</span><span class="${paidClass}">${paidLabel}</span></div>
    <p class="sub">Association Cosmétologie</p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t');
  if (!token) {
    return NextResponse.json(
      errorResponse('Token manquant'),
      { status: 400 }
    );
  }

  const payload = verifyMemberCardToken(token);
  if (!payload) {
    return NextResponse.json(
      errorResponse('Lien invalide ou expiré'),
      { status: 401 }
    );
  }

  await connectDB();

  const dbUser = await User.findById(payload.id).select('-password');
  if (!dbUser) {
    return NextResponse.json(errorResponse('Membre introuvable'), { status: 404 });
  }

  const profile = await Profile.findOne({ userId: dbUser._id });

  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : dbUser.email;

  const membershipStatus = profile?.membershipStatus ?? 'pending';
  const subscriptionPaidFlag = subscriptionPaid(
    membershipStatus,
    profile?.membershipExpiryDate
  );

  const data = {
    fullName,
    isActive: dbUser.isActive,
    subscriptionPaid: subscriptionPaidFlag,
    membershipStatus,
  };

  const accept = request.headers.get('accept') || '';
  const wantsJson =
    request.nextUrl.searchParams.get('format') === 'json' ||
    accept.includes('application/json');

  if (wantsJson) {
    return NextResponse.json(successResponse(data, 'Membre trouvé'));
  }

  return new NextResponse(buildHtml(data), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
