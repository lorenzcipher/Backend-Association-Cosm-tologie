import mongoose, { Document, Schema } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  authorId: mongoose.Types.ObjectId;
  tags: string[];
  isMemberOnly: boolean;
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  featuredImage: String,
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  isMemberOnly: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);