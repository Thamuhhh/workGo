import { Response } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification';
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

const serializeNotification = (n: any) => ({
  id: n._id.toString(),
  icon: n.type,
  title: n.title,
  body: n.body,
  type: n.type,
  data: n.data ?? {},
  read: n.isRead,
  createdAt: new Date(n.createdAt).toISOString(),
});

export const createNotification = async (data: {
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any>;
}): Promise<void> => {
  await Notification.create({
    userId: data.userId,
    title: data.title,
    body: data.body,
    type: data.type,
    data: data.data ?? {},
    isRead: false,
  });
};

export const listNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  if (!isDbReady(res)) return;

  const items = await Notification.find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.status(200).json({
    success: true,
    notifications: items.map(serializeNotification),
  });
};

export const markRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid notification id.' });
    return;
  }
  if (!isDbReady(res)) return;

  await Notification.updateOne(
    { _id: id, userId: req.user.userId, isRead: false },
    { $set: { isRead: true } }
  );
  res.status(200).json({ success: true });
};

export const markAllRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  if (!isDbReady(res)) return;

  await Notification.updateMany(
    { userId: req.user.userId, isRead: false },
    { $set: { isRead: true } }
  );
  res.status(200).json({ success: true });
};