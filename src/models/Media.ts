import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  title: string;
  description?: string;
  fileUrl: string;
  fileType: 'image' | 'video' | 'document';
  thumbnailUrl?: string;
  isMemberOnly: boolean;
  uploadedBy: mongoose.Types.ObjectId;
  tags: string[];
  views: number;
  createdAt: Date;
}

const MediaSchema: Schema = new Schema({
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
  fileType: {
    type: String,
    enum: ['image', 'video', 'document'],
    required: true
  },
  thumbnailUrl: String,
  isMemberOnly: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);