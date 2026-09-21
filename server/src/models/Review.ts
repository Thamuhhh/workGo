import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  rating: number; // 1 - 5
  tags: string[];
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    tags: { type: [String], default: [] },
    comment: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// One review per author per job
ReviewSchema.index({ jobId: 1, authorId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);