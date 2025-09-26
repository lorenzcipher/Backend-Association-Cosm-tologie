import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location: string;
  isOnline: boolean;
  isMemberOnly: boolean;
  maxParticipants?: number;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  createdBy: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  location: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isMemberOnly: {
    type: Boolean,
    default: false
  },
  maxParticipants: Number,
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationDeadline: Date,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);