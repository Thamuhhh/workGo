import { Response } from 'express';
import mongoose from 'mongoose';
import { Message } from '../models/Message';
import { Notification } from '../models/Notification';
import { Job } from '../models/Job';
import { User } from '../models/User';
import { Application } from '../models/Application';
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

const serializeMessage = (m: any) => ({
  id: m._id.toString(),
  jobId: m.jobId.toString(),
  sender: m.sender.toString(),
  senderRole: m.senderRole,
  text: m.text,
  read: m.read,
  timestamp: new Date(m.createdAt).toISOString(),
});

const userId = (r: AuthenticatedRequest): string | null => r.user?.userId ?? null;

export const listThreads = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const me = userId(req);
  if (!me) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  if (!isDbReady(res)) return;

  const mine = await Message.find({
    $or: [{ sender: me }, { recipient: me }],
  })
    .sort({ createdAt: -1 })
    .lean();

  const byJob = new Map<string, any[]>();
  mine.forEach((m: any) => {
    const key = m.jobId.toString();
    if (!byJob.has(key)) byJob.set(key, []);
    byJob.get(key)!.push(m);
  });

  const jobIds = [...byJob.keys()];
  const jobs = await Job.find({ _id: { $in: jobIds } }).lean();
  const jobById = new Map(jobs.map((j: any) => [j._id.toString(), j]));

  const threads: any[] = [];
  for (const [jobId, msgs] of byJob.entries()) {
    const job: any = jobById.get(jobId);
    if (!job) continue;
    const last = msgs[0];
    const otherId =
      last.sender.toString() === me ? last.recipient.toString() : last.sender.toString();
    const other = await User.findById(otherId).lean();
    const unread = msgs.filter(
      (m: any) => m.recipient.toString() === me && !m.read
    ).length;
    threads.push({
      jobId,
      jobTitle: job.title,
      otherName: other?.name ?? 'Worker',
      otherRole: other?.role ?? 'worker',
      otherPhone: other?.phone ?? '',
      lastMessage: last.text,
      lastTimestamp: new Date(last.createdAt).toISOString(),
      unread,
    });
  }

  threads.sort(
    (a, b) =>
      new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
  );
  res.status(200).json({ success: true, threads });
};

export const getThread = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const me = userId(req);
  if (!me) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  const { jobId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    res.status(400).json({ success: false, message: 'Invalid job id.' });
    return;
  }
  if (!isDbReady(res)) return;

  const messages = await Message.find({ jobId })
    .sort({ createdAt: 1 })
    .lean();

  const visible = messages.filter(
    (m: any) => m.sender.toString() === me || m.recipient.toString() === me
  );
  if (visible.length === 0) {
    // Only participants can open a thread; check job owner or applicant
    const job: any = await Job.findById(jobId).lean();
    if (!job || (job.postedBy.toString() !== me && !(await Application.exists({ jobId, workerId: me })))) {
      res.status(403).json({ success: false, message: 'You cannot access this chat.' });
      return;
    }
    res.status(200).json({ success: true, threadId: jobId, messages: [] });
    return;
  }

  res.status(200).json({
    success: true,
    threadId: jobId,
    messages: visible.map(serializeMessage),
  });
};

export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const me = userId(req);
  if (!me) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  const { jobId } = req.params;
  const { text } = req.body ?? {};
  const cleaned = String(text ?? '').trim();
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    res.status(400).json({ success: false, message: 'Invalid job id.' });
    return;
  }
  if (!cleaned) {
    res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    return;
  }
  if (!isDbReady(res)) return;

  const job: any = await Job.findById(jobId).populate('postedBy').lean();
  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found.' });
    return;
  }

  const sender = await User.findById(me).lean();
  const senderRole: 'worker' | 'employer' =
    job.postedBy._id.toString() === me ? 'employer' : 'worker';

  let recipient: string | null = null;
  if (senderRole === 'employer') {
    const targetWorker = String(req.body?.workerId ?? '').trim();
    if (
      targetWorker &&
      mongoose.Types.ObjectId.isValid(targetWorker)
    ) {
      recipient = targetWorker;
    } else {
      const app: any = await Application.findOne({ jobId })
        .sort({
          status: 1,
        })
        .lean();
      recipient = app ? app.workerId.toString() : null;
    }
  } else {
    recipient = job.postedBy._id.toString();
  }

  if (!recipient) {
    res.status(400).json({
      success: false,
      message: 'No applicant yet on this job to message.',
    });
    return;
  }

  const msg = await Message.create({
    jobId,
    sender: me,
    recipient,
    senderRole,
    text: cleaned,
    read: false,
  });

  await Notification.create({
    userId: recipient,
    title: senderRole === 'employer' ? 'New message' : 'New reply',
    body: cleaned,
    type: 'message',
    data: { jobId },
  });

  res.status(201).json({ success: true, message: serializeMessage(msg) });
};

export const markThreadRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const me = userId(req);
  if (!me) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  const { jobId } = req.params;
  if (!isDbReady(res)) return;

  await Message.updateMany(
    { jobId, recipient: me, read: false },
    { $set: { read: true } }
  );
  res.status(200).json({ success: true });
};

export const readAllThreads = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const me = userId(req);
  if (!me) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  if (!isDbReady(res)) return;

  await Message.updateMany(
    { recipient: me, read: false },
    { $set: { read: true } }
  );
  res.status(200).json({ success: true });
};