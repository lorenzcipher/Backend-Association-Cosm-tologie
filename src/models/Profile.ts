import mongoose, { Document, Schema } from 'mongoose';

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  phone?: string;
  professionalStatus: string;
  domainOfInterest: string[];
  address?: string;
  city?: string;
  country?: string;
  biography?: string;
  avatar?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  membershipStartDate?: Date;
  membershipExpiryDate?: Date;
  membershipStatus: 'pending' | 'active' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  professionalStatus: {
    type: String,
    required: true
  },
  domainOfInterest: [{
    type: String,
    enum: ['skincare', 'makeup', 'research', 'teaching', 'business', 'technology']
  }],
  address: String,
  city: String,
  country: String,
  biography: String,
  avatar: String,
  socialLinks: {
    linkedin: String,
    twitter: String,
    website: String
  },
  membershipStartDate: Date,
  membershipExpiryDate: Date,
  membershipStatus: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);