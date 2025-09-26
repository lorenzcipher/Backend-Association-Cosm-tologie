import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: string;
  isMemberOnly: boolean;
  uploadedBy: mongoose.Types.ObjectId;
  downloadCount: number;
  createdAt: Date;
}

const DocumentSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['forms', 'guidelines', 'research', 'presentations', 'certificates']
  },
  isMemberOnly: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);