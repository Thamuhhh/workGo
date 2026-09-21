import { create } from 'zustand';
import { getJobs, getJob, ServerJob } from '../services/jobs';
import { SampleJob } from '../data/sampleJobs';

export type WorkerJob = SampleJob & {
  description: string;
  city: string;
  rawDate: string;
  salaryNum: number;
  status: string;
};

export const toWorkerJob = (j: ServerJob): WorkerJob => ({
  id: j.id,
  title: j.title,
  category: j.category,
  employerName: j.employerName,
  location: j.location,
  distance: j.distance || 'Near you',
  date: j.date,
  timing: j.timing,
  workersRequired: j.workersRequired,
  workersAccepted: j.workersAccepted,
  salary: j.salary,
  employerRating: j.employerRating,
  foodProvided: j.foodProvided,
  transportProvided: j.transportProvided,
  requirements: j.requirements,
  about: j.description,
  latitude: j.latitude,
  longitude: j.longitude,
  description: j.description,
  city: j.city,
  rawDate: j.rawDate,
  salaryNum: j.salaryNum,
  status: j.status,
});

interface JobsState {
  jobs: WorkerJob[];
  loading: boolean;
  error: string | null;
  loadJobs: (force?: boolean) => Promise<void>;
  jobById: (id: string) => WorkerJob | undefined;
  getJobDetail: (id: string) => Promise<WorkerJob | undefined>;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  loading: false,
  error: null,

  loadJobs: async (force = false) => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const serverJobs = await getJobs();
      set({ jobs: serverJobs.map(toWorkerJob), loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Failed to load jobs.' });
    }
  },

  jobById: (id) => get().jobs.find((j) => j.id === id),

  getJobDetail: async (id) => {
    const cached = get().jobById(id);
    if (cached) return cached;
    const serverJob = await getJob(id);
    if (!serverJob) return undefined;
    const workerJob = toWorkerJob(serverJob);
    set((s) => ({
      jobs: s.jobs.some((j) => j.id === workerJob.id) ? s.jobs : [workerJob, ...s.jobs],
    }));
    return workerJob;
  },
}));

export function findJobById(id: string, source: WorkerJob[]): WorkerJob | undefined {
  return source.find((j) => j.id === id);
}

export function areaJobCount(
  jobs: WorkerJob[],
  label: string,
  address = ''
): number {
  const needles = [label, address]
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (needles.length === 0) return jobs.length;
  return jobs.filter((j) => {
    const city = (j.city || '').toLowerCase();
    const loc = (j.location || '').toLowerCase();
    return needles.some((n) => city === n || loc === n || city.includes(n) || loc.includes(n));
  }).length;
}