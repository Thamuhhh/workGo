import mongoose, { Document, Schema } from 'mongoose';

export interface WalletTxnSubdoc {
  id: string;
  title: string;
  meta: string;
  amount: number; // positive credit, negative debit
  timestamp: Date;
}

export interface IWallet extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  balance: number;
  totalEarned: number;
  upiId: string;
  transactions: WalletTxnSubdoc[];
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0, min: 0 },
    upiId: { type: String, default: '', trim: true },
    transactions: {
      type: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          meta: { type: String, default: '' },
          amount: { type: Number, required: true },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);