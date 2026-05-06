import jwt, { Secret } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';

function getQrSecret(): Secret {
  const secret = process.env.QR_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing QR_SECRET (or JWT_SECRET) env var');
  }
  return secret as Secret;
}

// Next.js 15: params must be a Promise
interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function QrVerificationPage(props: PageProps) {
  const { token: rawToken } = await props.params;
  const token = decodeURIComponent(rawToken);

  try {
    const decoded = jwt.verify(token, getQrSecret()) as { t?: string; uid?: string };
    if (decoded?.t !== 'user-qr' || !decoded?.uid) {
      throw new Error('invalid-payload');
    }

    await connectDB();
    const user = await User.findById(decoded.uid).select('-password');
    const profile = user ? await Profile.findOne({ userId: user._id }) : null;

    if (!user || !profile) {
      return (
        <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>QR invalide</h1>
          <p>Utilisateur introuvable.</p>
        </main>
      );
    }

    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    const isActive = Boolean(user.isActive);
    const subscriptionPaid = Boolean(profile.payed);

    return (
      <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 560 }}>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>Vérification</h1>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{fullName}</div>

          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              <strong>Actif</strong>: {isActive ? 'Oui' : 'Non'}
            </div>
            <div>
              <strong>Abonnement payé</strong>: {subscriptionPaid ? 'Oui' : 'Non'}
            </div>
          </div>
        </div>
      </main>
    );
  } catch {
    return (
      <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>QR invalide</h1>
        <p>Token invalide ou expiré.</p>
      </main>
    );
  }
}

