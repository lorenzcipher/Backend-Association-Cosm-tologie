import jwt from 'jsonwebtoken';

const PURPOSE = 'member_card';

export function signMemberCardToken(userId: string): string {
  return jwt.sign(
    { id: userId, purpose: PURPOSE },
    process.env.JWT_SECRET!,
    { expiresIn: '365d' }
  );
}

export function verifyMemberCardToken(token: string): { id: string } | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      purpose?: string;
    };
    if (decoded.purpose !== PURPOSE) {
      return null;
    }
    return { id: decoded.id };
  } catch {
    return null;
  }
}
