import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    _id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    
    await connectDB();
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return null;
    }

    // Check if user's profile is blocked
    const profile = await Profile.findOne({ userId: user._id });
    if (profile && profile.status === 'blocked') {
      return null;
    }
    
    return user;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export async function requireAuth(request: NextRequest) {
  const token = extractTokenFromHeader(request);
  
  if (!token) {
    return null;
  }
  
  return await verifyToken(token);
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request);
  
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  return user;
}