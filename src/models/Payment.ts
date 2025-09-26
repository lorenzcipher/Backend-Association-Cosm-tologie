import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  type: 'membership' | 'event' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  stripePaymentIntentId?: string;
  description: string;
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  type: {
    type: String,
    enum: ['membership', 'event', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  stripePaymentIntentId: String,
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);