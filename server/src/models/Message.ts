import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  senderRole: 'worker' | 'employer';
  text: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderRole: { type: String, enum: ['worker', 'employer'], required: true },
    text: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ jobId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);