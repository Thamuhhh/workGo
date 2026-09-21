import { Response } from 'express';
import mongoose from 'mongoose';
import { Review } from '../models/Review';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { dbStatus } from '../config/db';
import { AuthenticatedRequest } from '../types';

const isDbReady = (res: Response): boolean => {
  if (dbStatus.isConnected && mongoose.connection.readyState === 1) return true;
  res
    .status(503)
    .json({ success: false, message: 'Database not ready. Please try again.' });
  return false;
};

const AUTHOR_POPULATE = { path: 'authorId', select: 'name profilePhoto' };

const serialize = (r: any) => ({
  id: r._id.toString(),
  jobId: r.jobId.toString(),
  targetId: r.targetId.toString(),
  rating: r.rating,
  tags: r.tags ?? [],
  comment: r.comment ?? '',
  created: r.createdAt,
  authorName: r.authorId?.name ?? 'User',
  authorPhoto: r.authorId?.profilePhoto ?? '',
});

const validateShared = (body: any) => {
  const jobId = String(body?.jobId ?? '').trim();
  if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
    return { error: 'A valid jobId is required.' };
  }
  const rating = Math.round(Number(body?.rating));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: 'Rating must be an integer 1–5.' };
  }
  const tags = Array.isArray(body?.tags)
    ? body.tags.map((t: unknown) => String(t).trim()).filter(Boolean).slice(0, 8)
    : [];
  const comment = String(body?.comment ?? '').trim().slice(0, 500);
  return { jobId, rating, tags, comment };
};

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const shared = validateShared(req.body ?? {});
  if (shared.error) {
    res.status(400).json({ success: false, message: shared.error });
    return;
  }

  const jobId = shared.jobId!;
  const isEmployer = req.user.role === 'employer';

  if (isEmployer) {
    const workerId = String(req.body?.workerId ?? '').trim();
    if (!workerId || !mongoose.Types.ObjectId.isValid(workerId)) {
      res.status(400).json({ success: false, message: 'A valid workerId is required.' });
      return;
    }
    if (workerId === req.user.userId) {
      res.status(403).json({ success: false, message: 'You cannot review yourself.' });
      return;
    }
    if (!isDbReady(res)) return;
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found.' });
      return;
    }
    if (!job.postedBy.equals(req.user.userId)) {
      res.status(403).json({ success: false, message: 'You can only review your own jobs.' });
      return;
    }
    const app = await Application.findOne({
      jobId: job._id,
      workerId,
      status: { $in: ['ACCEPTED', 'COMPLETED'] },
    });
    if (!app) {
      res.status(403).json({ success: false, message: 'This worker was not accepted to this job.' });
      return;
    }
    const existing = await Review.findOne({ jobId: job._id, authorId: req.user.userId });
    if (existing) {
      res.status(409).json({ success: false, message: 'You already reviewed this job.' });
      return;
    }
    const review = await Review.create({
      jobId: job._id,
      authorId: req.user.userId,
      targetId: new mongoose.Types.ObjectId(workerId),
      rating: shared.rating,
      tags: shared.tags,
      comment: shared.comment,
    });
    const full = await Review.populate(review, AUTHOR_POPULATE);
    res.status(201).json({ success: true, review: serialize(full) });
    return;
  }

  // worker → employer
  if (!isDbReady(res)) return;
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found.' });
    return;
  }
  if (job.postedBy.equals(req.user.userId)) {
    res.status(403).json({ success: false, message: 'You cannot review your own job.' });
    return;
  }
  const app = await Application.findOne({
    jobId: job._id,
    workerId: req.user.userId,
    status: { $in: ['ACCEPTED', 'COMPLETED'] },
  });
  if (!app) {
    res.status(403).json({
      success: false,
      message: 'You can only review jobs you were accepted to.',
    });
    return;
  }
  const existing = await Review.findOne({ jobId: job._id, authorId: req.user.userId });
  if (existing) {
    res.status(409).json({ success: false, message: 'You already reviewed this job.' });
    return;
  }
  const review = await Review.create({
    jobId: job._id,
    authorId: req.user.userId,
    targetId: job.postedBy,
    rating: shared.rating,
    tags: shared.tags,
    comment: shared.comment,
  });
  const full = await Review.populate(review, AUTHOR_POPULATE);
  res.status(201).json({ success: true, review: serialize(full) });
};

export const getJobReviews = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.params.jobId || !mongoose.Types.ObjectId.isValid(req.params.jobId)) {
    res.status(400).json({ success: false, message: 'Invalid jobId.' });
    return;
  }
  if (!isDbReady(res)) return;

  const [reviews, stats] = await Promise.all([
    Review.find({ jobId: req.params.jobId }).sort({ createdAt: -1 }).populate(AUTHOR_POPULATE),
    Review.aggregate([
      { $match: { jobId: new mongoose.Types.ObjectId(req.params.jobId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    reviews: reviews.map(serialize),
    rating: stats[0] ? { avg: Number(stats[0].avg.toFixed(1)), total: stats[0].total } : null,
  });
};

export const myReviews = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  if (!isDbReady(res)) return;

  const [written, received] = await Promise.all([
    Review.find({ authorId: req.user.userId }).sort({ createdAt: -1 }),
    Review.find({ targetId: req.user.userId }).sort({ createdAt: -1 }).populate(AUTHOR_POPULATE),
  ]);

  res.status(200).json({
    success: true,
    written: written.map(serialize),
    received: received.map(serialize),
  });
};