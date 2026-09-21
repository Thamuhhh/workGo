import { Response } from 'express';
import mongoose from 'mongoose';
import { Wallet } from '../models/Wallet';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { dbStatus } from '../config/db';
import { AuthenticatedRequest } from '../types';

const isDbReady = (res: Response): boolean => {
  if (dbStatus.isConnected && mongoose.connection.readyState === 1) return true;
  res.status(503).json({
    success: false,
    message:
      'Database unavailable. Start MongoDB (or set MONGODB_URI in server/.env) and restart the server.',
  });
  return false;
};

const txnId = (): string =>
  `tx_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;

const serializeWallet = (w: any) => ({
  id: w._id.toString(),
  balance: w.balance,
  totalEarned: w.totalEarned,
  upiId: w.upiId,
  transactions: (w.transactions ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    meta: t.meta,
    amount: t.amount,
    timestamp: new Date(t.timestamp).toISOString(),
  })),
});

const getOrCreate = async (userId: string) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      balance: 0,
      totalEarned: 0,
      upiId: '',
      transactions: [],
    });
  }
  return wallet;
};

export const getWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  if (!isDbReady(res)) return;
  const wallet = await getOrCreate(req.user.userId);
  res.status(200).json({ success: true, wallet: serializeWallet(wallet) });
};

export const addMoney = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const amount = Math.round(Number(req.body?.amount));
  if (!(amount > 0)) {
    res.status(400).json({
      success: false,
      message: 'Enter a valid amount to add.',
    });
    return;
  }

  if (!isDbReady(res)) return;
  const wallet = await getOrCreate(req.user.userId);
  wallet.balance += amount;
  wallet.transactions.push({
    id: txnId(),
    title: 'Added to wallet',
    meta: 'Instant UPI',
    amount,
    timestamp: new Date(),
  });
  await wallet.save();

  res.status(200).json({ success: true, wallet: serializeWallet(wallet) });
};

export const withdraw = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  if (!isDbReady(res)) return;
  const wallet = await getOrCreate(req.user.userId);
  if (wallet.balance <= 0) {
    res.status(400).json({
      success: false,
      message: 'No balance to withdraw.',
    });
    return;
  }

  const amount = wallet.balance;
  wallet.balance = 0;
  wallet.transactions.push({
    id: txnId(),
    title: 'Instant withdrawal to UPI',
    meta: wallet.upiId || 'UPI',
    amount: -amount,
    timestamp: new Date(),
  });
  await wallet.save();

  res.status(200).json({ success: true, wallet: serializeWallet(wallet) });
};

export const credit = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  if (req.user.role !== 'employer') {
    res.status(403).json({
      success: false,
      message: 'Only employers can credit worker payments.',
    });
    return;
  }

  const workerId = String(req.body?.workerId ?? '').trim();
  if (!workerId || !mongoose.Types.ObjectId.isValid(workerId)) {
    res.status(400).json({
      success: false,
      message: 'A valid workerId is required.',
    });
    return;
  }
  if (workerId === req.user.userId) {
    res.status(403).json({
      success: false,
      message: 'You cannot credit your own wallet.',
    });
    return;
  }

  const amount = Math.round(Number(req.body?.amount));
  if (!(amount > 0)) {
    res.status(400).json({
      success: false,
      message: 'Enter a valid credit amount.',
    });
    return;
  }

  if (!isDbReady(res)) return;

  const ownedJobs = await Job.find({ postedBy: req.user.userId }).select('_id');
  const ownedJobIds = ownedJobs.map((j) => j._id);
  const application = await Application.findOne({
    workerId,
    jobId: { $in: ownedJobIds },
    status: { $in: ['APPLIED', 'SHORTLISTED', 'ACCEPTED', 'COMPLETED'] },
  });
  if (!application) {
    res.status(403).json({
      success: false,
      message: 'This worker has no active application on your jobs.',
    });
    return;
  }

  const worker = await User.findById(workerId);
  if (!worker || worker.role !== 'worker') {
    res.status(400).json({ success: false, message: 'Invalid worker account.' });
    return;
  }

  const wallet = await getOrCreate(workerId);
  wallet.balance += amount;
  wallet.totalEarned = (wallet.totalEarned ?? 0) + amount;
  wallet.transactions.push({
    id: txnId(),
    title: String(req.body?.title ?? 'Work earnings'),
    meta: String(req.body?.meta ?? 'Gig payout'),
    amount,
    timestamp: new Date(),
  });
  await wallet.save();

  res.status(200).json({ success: true, wallet: serializeWallet(wallet) });
};

export const setUpi = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const upiId = String(req.body?.upiId ?? '').trim();
  if (!upiId) {
    res.status(400).json({ success: false, message: 'Enter a valid UPI ID.' });
    return;
  }

  if (!isDbReady(res)) return;
  const wallet = await getOrCreate(req.user.userId);
  wallet.upiId = upiId;
  await wallet.save();

  res.status(200).json({ success: true, wallet: serializeWallet(wallet) });
};