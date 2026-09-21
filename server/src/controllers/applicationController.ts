import { Response } from 'express';
import mongoose from 'mongoose';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { Message } from '../models/Message';
import { dbStatus } from '../config/db';
import { AuthenticatedRequest, ApplicationStatus } from '../types';
import { createNotification } from './notificationController';

const isDbReady = (res: Response): boolean => {
  if (dbStatus.isConnected && mongoose.connection.readyState === 1) return true;
  res.status(503).json({
    success: false,
    message:
      'Database unavailable. Start MongoDB (or set MONGODB_URI in server/.env) and restart the server.',
  });
  return false;
};

const VALID_UPDATES: ApplicationStatus[] = [
  'SHORTLISTED',
  'ACCEPTED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
];

const serializeApp = (app: any) => {
  const worker = app.workerId as any;
  const job = app.jobId as any;
  const employer = job?.postedBy as any;
  return {
    id: app._id.toString(),
    jobId: job?._id ? job._id.toString() : String(app.jobId),
    jobTitle: job?.title ?? '',
    employerName: employer?.businessName || employer?.name || 'WorkGo Employer',
    salaryNum: job?.salary ?? 0,
    workerId: worker?._id ? worker._id.toString() : '',
    workerName: worker?.name ?? '',
    workerArea:
      worker?.location?.city || worker?.location?.address || job?.location?.city || '',
    status: app.status,
    appliedAt: app.appliedAt || app.createdAt,
  };
};

const POPULATE_WORKER = { path: 'workerId', select: 'name location.city location.address' };
const POPULATE_JOB = {
  path: 'jobId',
  select: 'title salary location.city postedBy',
  populate: { path: 'postedBy', select: 'name businessName' },
};

export const applyToJob = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const jobId = String((req.body as any)?.jobId || '').trim();
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    res.status(400).json({ success: false, message: 'Valid jobId is required.' });
    return;
  }

  if (!isDbReady(res)) return;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found.' });
    return;
  }
  if (job.postedBy.equals(req.user.userId)) {
    res
      .status(400)
      .json({ success: false, message: "You can't apply to a job you posted." });
    return;
  }
  if (job.status !== 'OPEN') {
    res
      .status(400)
      .json({ success: false, message: 'This job is closed for applications.' });
    return;
  }

  const existing = await Application.findOne({
    jobId: job._id,
    workerId: req.user.userId,
  });
  if (existing) {
    res.status(400).json({ success: false, message: "You've already applied to this job." });
    return;
  }

  const application = await Application.create({
    jobId: job._id,
    workerId: req.user.userId,
    status: 'APPLIED',
  });
  const full = await application.populate([POPULATE_WORKER, POPULATE_JOB]);

  res.status(201).json({ success: true, application: serializeApp(full) });
};

export const myApplications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  if (!isDbReady(res)) return;

  let applications;
  if (req.user.role === 'employer') {
    const myJobs = await Job.find({ postedBy: req.user.userId }).select('_id');
    const jobIds = myJobs.map((j) => j._id);
    applications = await Application.find({ jobId: { $in: jobIds } })
      .sort({ appliedAt: -1 })
      .populate([POPULATE_WORKER, POPULATE_JOB]);
  } else {
    applications = await Application.find({ workerId: req.user.userId })
      .sort({ appliedAt: -1 })
      .populate([POPULATE_WORKER, POPULATE_JOB]);
  }

  const valid = (applications as any[]).filter((a: any) => a.jobId);
  res.status(200).json({
    success: true,
    applications: valid.map((a) => serializeApp(a)),
  });
};

export const hiredWorkers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  if (!isDbReady(res)) return;

  const myJobs = await Job.find({ postedBy: req.user.userId }).select('_id');
  const jobIds = myJobs.map((j) => j._id);
  const applications = await Application.find({
    jobId: { $in: jobIds },
    status: { $in: ['ACCEPTED', 'COMPLETED'] as ApplicationStatus[] },
  })
    .sort({ appliedAt: -1 })
    .populate([POPULATE_WORKER, POPULATE_JOB]);

  res.status(200).json({
    success: true,
    applications: applications.map((a) => serializeApp(a)),
  });
};

export const jobApplications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const jobId = req.params.jobId;
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    res.status(400).json({ success: false, message: 'Invalid jobId.' });
    return;
  }

  if (!isDbReady(res)) return;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found.' });
    return;
  }
  if (!job.postedBy.equals(req.user.userId)) {
    res.status(403).json({
      success: false,
      message: 'You can only view applications for jobs you posted.',
    });
    return;
  }

  const applications = await Application.find({ jobId: job._id })
    .sort({ appliedAt: -1 })
    .populate([POPULATE_WORKER, POPULATE_JOB]);

  res.status(200).json({
    success: true,
    applications: applications.map((a) => serializeApp(a)),
  });
};

export const updateApplicationStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const id = req.params.id;
  const status = String((req.body as any)?.status || '').toUpperCase() as ApplicationStatus;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid application id.' });
    return;
  }
  if (!VALID_UPDATES.includes(status)) {
    res.status(400).json({ success: false, message: `Invalid status: ${status}.` });
    return;
  }

  if (!isDbReady(res)) return;

  const application = await Application.findById(id).populate([POPULATE_WORKER, POPULATE_JOB]);
  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found.' });
    return;
  }

  const jobId = (application as any).jobId as any;
  const job = await Job.findById(jobId?._id ?? jobId);
  if (!job) {
    res.status(404).json({ success: false, message: 'Referenced job not found.' });
    return;
  }
  if (!job.postedBy.equals(req.user.userId)) {
    res.status(403).json({
      success: false,
      message: 'You can only update applications for jobs you posted.',
    });
    return;
  }

  const previous = application.status;
  application.status = status;
  await application.save();

  if (status === 'ACCEPTED' && previous !== 'ACCEPTED') {
    if ((job.workersAccepted ?? 0) < job.workersRequired) {
      job.workersAccepted = (job.workersAccepted ?? 0) + 1;
      await job.save();
    }
    const workerId = application.workerId.toString();
    const employerName =
      (application.jobId as any)?.postedBy?.businessName ||
      (application.jobId as any)?.postedBy?.name ||
      'WorkGo Employer';
    await createNotification({
      userId: workerId,
      title: 'Application accepted 🎉',
      body: `${employerName} accepted your application for ${(application.jobId as any)?.title}.`,
      type: 'accepted',
      data: { jobId: (application.jobId as any)?._id?.toString?.() ?? id },
    });
    await Message.create({
      jobId: (application.jobId as any)?._id ?? jobId,
      sender: req.user.userId,
      recipient: workerId,
      senderRole: 'employer',
      text: `Hi! Your application for ${(application.jobId as any)?.title ?? 'the job'} was accepted. Please arrive on time and carrying your ID.`,
      read: false,
    });
  } else if (status === 'REJECTED' && previous !== 'REJECTED') {
    await createNotification({
      userId: application.workerId.toString(),
      title: 'Application update',
      body: `You were not selected for ${(application.jobId as any)?.title ?? 'a job'}. Keep trying — new jobs are posted daily.`,
      type: 'rejected',
      data: { jobId: (application.jobId as any)?._id?.toString?.() ?? id },
    });
  } else if (status === 'COMPLETED' && previous !== 'COMPLETED') {
    await createNotification({
      userId: application.workerId.toString(),
      title: 'Gig completed ✅',
      body: `Great job! ${(application.jobId as any)?.title ?? 'Your gig'} is marked complete.`,
      type: 'payout',
      data: { jobId: (application.jobId as any)?._id?.toString?.() ?? id },
    });
  }

  if (previous === 'ACCEPTED' && status !== 'ACCEPTED') {
    job.workersAccepted = Math.max(0, (job.workersAccepted ?? 0) - 1);
    await job.save();
  }

  res.status(200).json({
    success: true,
    application: serializeApp(application),
  });
};