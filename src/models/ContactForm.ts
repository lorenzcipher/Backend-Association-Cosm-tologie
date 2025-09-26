import mongoose, { Document, Schema } from 'mongoose';

export interface IContactForm extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  respondedAt?: Date;
  respondedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ContactFormSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  respondedAt: Date,
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.models.ContactForm || mongoose.model<IContactForm>('ContactForm', ContactFormSchema);