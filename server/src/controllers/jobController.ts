import { Response } from 'express';
import mongoose from 'mongoose';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Review } from '../models/Review';
import { dbStatus } from '../config/db';
import { AuthenticatedRequest } from '../types';
import { createJobSchema, updateJobSchema, parseZod } from '../validators/jobSchema';

const isDbReady = (res: Response): boolean => {
  if (dbStatus.isConnected && mongoose.connection.readyState === 1) return true;
  res.status(503).json({
    success: false,
    message:
      'Database unavailable. Start MongoDB (or set MONGODB_URI in server/.env) and restart the server.',
  });
  return false;
};

const pad = (n: number): string => String(n).padStart(2, '0');
const iso = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const friendlyDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const today = iso(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === today) return 'Today';
  if (dateStr === iso(tomorrow)) return 'Tomorrow';
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    return `${parts[2]} ${MONTHS[parts[1] - 1] ?? ''}`.trim();
  }
  return dateStr;
};

const haversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const toNum = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const serializeJob = (
  job: any,
  userLat?: number,
  userLng?: number,
  ratingInfo?: { avg: number; total: number }
) => {
  const employer = job.postedBy as any;

  let distance = '';
  if (
    userLat !== undefined &&
    userLng !== undefined &&
    job.location?.latitude &&
    job.location?.longitude
  ) {
    distance = `${haversine(
      userLat,
      userLng,
      job.location.latitude,
      job.location.longitude
    ).toFixed(1)} km away`;
  }

  const rating = ratingInfo && ratingInfo.total > 0 ? ratingInfo.avg : null;

  return {
    id: job._id.toString(),
    title: job.title,
    category: job.category,
    description: job.description,
    employerName: employer?.businessName || employer?.name || 'WorkGo Employer',
    employerRating:
      rating != null ? `${rating.toFixed(1)} Rating (${ratingInfo!.total})` : '',
    ratingCount: ratingInfo?.total ?? 0,
    location: job.location?.address ?? '',
    city: job.location?.city ?? '',
    latitude: job.location?.latitude ?? 0,
    longitude: job.location?.longitude ?? 0,
    distance,
    date: friendlyDate(job.date),
    rawDate: job.date,
    timing: `${job.startTime || ''} - ${job.endTime || ''}`,
    workersRequired: job.workersRequired,
    workersAccepted: job.workersAccepted ?? 0,
    salary: `₹${job.salary} / ${job.paymentType === 'per_hour' ? 'hour' : 'day'}`,
    salaryNum: job.salary,
    foodProvided: !!job.foodProvided,
    transportProvided: !!job.transportProvided,
    requirements: (job.requirements?.skills ?? []).join(', ') || '',
    status: job.status,
  };
};

const POPULATE = { path: 'postedBy', select: 'name businessName rating' };

const reviewStatsByJob = async (
  jobs: any[]
): Promise<Map<string, { avg: number; total: number }>> => {
  const map = new Map<string, { avg: number; total: number }>();
  const targetIds = Array.from(
    new Set(
      jobs
        .map((j) => j.postedBy?._id)
        .filter((id: any) => id != null)
    )
  );
  if (targetIds.length === 0) return map;
  const rows = await Review.aggregate([
    { $match: { targetId: { $in: targetIds } } },
    { $group: { _id: '$targetId', avg: { $avg: '$rating' }, total: { $sum: 1 } } },
  ]);
  rows.forEach((r: any) => {
    map.set(r._id.toString(), { avg: Number(r.avg.toFixed(1)), total: r.total });
  });
  return map;
};

export const listJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const lat = toNum(req.query.lat);
  const lng = toNum(req.query.lng);

  if (!isDbReady(res)) return;

  const filter: Record<string, unknown> = { status: 'OPEN' };
  const q = String(req.query.q ?? '').trim();
  if (q) {
    filter.$or = [
      { title: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { category: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { description: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    ];
  }
  if (req.query.category && String(req.query.category).trim()) {
    filter.category = String(req.query.category).trim();
  }
  if (req.query.city && String(req.query.city).trim()) {
    filter['location.city'] = new RegExp(
      String(req.query.city).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i'
    );
  }

  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
  const skip = (page - 1) * limit;

  const [total, jobs] = await Promise.all([
    Job.countDocuments(filter),
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(POPULATE),
  ]);
  const stats = await reviewStatsByJob(jobs);

  res.status(200).json({
    success: true,
    jobs: jobs.map((j) =>
      serializeJob(j, lat, lng, stats.get(j.postedBy?._id?.toString()))
    ),
    total,
    page,
    limit,
  });
};

export const listCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!isDbReady(res)) return;
  const categories = (await Job.distinct('category'))
    .map((c) => String(c).trim())
    .filter(Boolean)
    .sort();
  res.status(200).json({ success: true, categories, total: categories.length });
};

export const myJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const lat = toNum(req.query.lat);
  const lng = toNum(req.query.lng);

  if (!isDbReady(res)) return;
  const jobs = await Job.find({ postedBy: req.user.userId })
    .sort({ createdAt: -1 })
    .populate(POPULATE);
  const stats = await reviewStatsByJob(jobs);

  res.status(200).json({
    success: true,
    jobs: jobs.map((j) =>
      serializeJob(j, lat, lng, stats.get(j.postedBy?._id?.toString()))
    ),
  });
};

export const getJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!isDbReady(res)) return;
  const job = await Job.findById(req.params.id).populate(POPULATE);
  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found.' });
    return;
  }
  const stats = await reviewStatsByJob([job]);

  res.status(200).json({
    success: true,
    job: serializeJob(
      job,
      toNum(req.query.lat),
      toNum(req.query.lng),
      stats.get(job.postedBy?._id?.toString())
    ),
  });
};

export const createJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const { data, error } = parseZod(createJobSchema, req.body ?? {});
  if (error) {
    res.status(400).json({ success: false, message: error });
    return;
  }
  const body = data;

  if (!isDbReady(res)) return;

  const job = await Job.create({
    title: body.title,
    category: body.category,
    description:
      body.description || `${body.category} work available near ${body.location}.`,
    postedBy: req.user.userId,
    location: {
      address: body.location,
      latitude: Number(body.latitude) || 0,
      longitude: Number(body.longitude) || 0,
      city: String(body.city || '').trim(),
    },
    date: body.date,
    startTime: String(body.startTime || '6 AM').trim(),
    endTime: String(body.endTime || '4 PM').trim(),
    workersRequired: body.workersRequired ?? 1,
    workersAccepted: 0,
    salary: body.salary,
    paymentType: 'per_day',
    foodProvided: !!body.foodProvided,
    transportProvided: !!body.transportProvided,
    requirements: {
      skills: Array.isArray(body.skills) ? body.skills.map(String) : [],
    },
    status: 'OPEN',
  });

  const full = await Job.populate(job, POPULATE);
  res.status(201).json({ success: true, job: serializeJob(full) });
};

const EDITABLE = [
  'title',
  'category',
  'description',
  'date',
  'startTime',
  'endTime',
  'workersRequired',
  'workersAccepted',
  'salary',
  'foodProvided',
  'transportProvided',
  'status',
] as const;

export const updateJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const { data, error } = parseZod(updateJobSchema, req.body ?? {});
  if (error) {
    res.status(400).json({ success: false, message: error });
    return;
  }
  const body = data;

  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found.' });
    return;
  }

  if (!job.postedBy.equals(req.user.userId)) {
    res.status(403).json({
      success: false,
      message: 'You can only edit jobs you posted.',
    });
    return;
  }

  if (!isDbReady(res)) return;
  for (const key of EDITABLE) {
    if (body[key] !== undefined) {
      (job as any)[key] = body[key];
    }
  }
  if (typeof body.location === 'string' && body.location.trim()) {
    const current = job.location ?? { address: '', latitude: 0, longitude: 0, city: '' };
    job.location = {
      address: String(body.location).trim(),
      latitude: Number(body.latitude) || current.latitude || 0,
      longitude: Number(body.longitude) || current.longitude || 0,
      city: String(body.city || current.city || '').trim(),
    };
  }

  if (body.skills && Array.isArray(body.skills)) {
    job.requirements = { ...job.requirements, skills: body.skills.map(String) };
  }

  job.workersAccepted = Math.max(0, Math.min(job.workersAccepted ?? 0, job.workersRequired));
  job.workersAccepted = Math.round(job.workersAccepted || 0);

  await job.save();

  const full = await Job.populate(job, POPULATE);
  res.status(200).json({ success: true, job: serializeJob(full) });
};

export const deleteJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  if (!isDbReady(res)) return;

  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found.' });
    return;
  }
  if (!job.postedBy.equals(req.user.userId)) {
    res.status(403).json({
      success: false,
      message: 'You can only delete jobs you posted.',
    });
    return;
  }

  const hasApps = await Application.exists({
    jobId: job._id,
    status: { $in: ['APPLIED', 'SHORTLISTED', 'ACCEPTED', 'COMPLETED'] },
  });
  if (hasApps) {
    job.status = 'CANCELLED';
    await job.save();
    res.status(200).json({
      success: true,
      message: 'Job closed instead of deleted (it has applications).',
      job: serializeJob(job),
    });
    return;
  }

  await Job.deleteOne({ _id: job._id });
  res.status(200).json({ success: true, message: 'Job deleted.' });
};