import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createJob,
  updateJob as updateJobApi,
  deleteJob,
  getMyJobs,
  ServerJob,
  CreateJobPayload,
} from '../services/jobs';

export type JobStatus = 'OPEN' | 'FILLING' | 'CLOSED';

export interface EmployerJob {
  id: string;
  title: string;
  category: string;
  workersRequired: number;
  salaryPerDay: number;
  foodProvided: boolean;
  transportProvided: boolean;
  date: string;
  location: string;
  hired: number;
  status: JobStatus;
  createdAt: string;
}

export interface EmployerJobInput {
  title: string;
  category: string;
  workersRequired: number;
  salaryPerDay: number;
  foodProvided: boolean;
  transportProvided: boolean;
  date: string;
  location: string;
}

interface EmployerJobsState {
  jobs: EmployerJob[];
  loading: boolean;
  addJob: (job: EmployerJobInput) => Promise<void>;
  updateJob: (id: string, patch: Partial<Omit<EmployerJob, 'id' | 'createdAt'>>) => Promise<void>;
  duplicateJob: (id: string) => Promise<string | null>;
  bumpHired: (id: string) => Promise<void>;
  removeJob: (id: string) => Promise<string>;
  loadStoredJobs: () => Promise<void>;
}

const EMPLOYER_JOBS_STORAGE_KEY = '@workgo_employer_jobs';

const pad = (n: number): string => String(n).padStart(2, '0');
const iso = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const inDays = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

const mapStatus = (s: string): JobStatus =>
  s === 'OPEN' ? 'OPEN' : s === 'FILLED' ? 'FILLING' : 'CLOSED';

const toEmployerJob = (j: ServerJob): EmployerJob => ({
  id: j.id,
  title: j.title,
  category: j.category,
  workersRequired: j.workersRequired,
  salaryPerDay: j.salaryNum,
  foodProvided: j.foodProvided,
  transportProvided: j.transportProvided,
  date: `${j.date} · ${j.timing}`,
  location: j.location,
  hired: j.workersAccepted,
  status: mapStatus(j.status),
  createdAt: new Date().toISOString(),
});

function persist(jobs: EmployerJob[]) {
  try {
    AsyncStorage.setItem(EMPLOYER_JOBS_STORAGE_KEY, JSON.stringify(jobs)).catch((e) =>
      console.error('Failed to persist employer job:', e)
    );
  } catch (e) {
    console.error('Failed to persist employer job:', e);
  }
}

const dateTextToISO = (dateText: string): string => {
  const t = dateText.trim();
  if (t === 'Today') return inDays(0);
  if (t === 'Tomorrow') return inDays(1);
  if (t === 'Day after') return inDays(2);
  const parsed = new Date(t);
  if (!isNaN(parsed.getTime())) return iso(parsed);
  return inDays(1);
};

const buildPayload = (input: EmployerJobInput): CreateJobPayload => {
  const [dateText, timeText = 'Full Day'] = input.date.split(' · ') as [string, string?];
  const times = timeText === 'Full Day' ? null : timeText.split(' - ');
  return {
    title: input.title,
    category: input.category,
    location: input.location,
    date: dateTextToISO(dateText),
    salary: input.salaryPerDay,
    workersRequired: input.workersRequired,
    foodProvided: input.foodProvided,
    transportProvided: input.transportProvided,
    startTime: times?.[0]?.trim() ?? '6 AM',
    endTime: times?.[1]?.trim() ?? '4 PM',
    description: `${input.category} work available near ${input.location}.`,
  };
};

export const useEmployerJobsStore = create<EmployerJobsState>((set, get) => ({
  jobs: [],
  loading: false,

  addJob: async (input) => {
    let job: EmployerJob = {
      ...input,
      id: `job_${Date.now()}`,
      hired: 0,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    const created = await createJob(buildPayload(input)).catch(() => null);
    if (created) {
      job = toEmployerJob(created);
    }

    const jobs = [job, ...get().jobs];
    set({ jobs });
    persist(jobs);
  },

  updateJob: async (id, patch) => {
    const existing = get().jobs.find((j) => j.id === id);

    let nextJobs: EmployerJob[];
    try {
      const updated = existing
        ? await updateJobApi(id, buildPayloadFromPatch(existing, patch))
        : null;
      nextJobs = updated
        ? get().jobs.map((j) => (j.id === id ? toEmployerJob(updated) : j))
        : get().jobs.map((j) => (j.id === id ? { ...j, ...patch } : j));
    } catch {
      nextJobs = get().jobs.map((j) => (j.id === id ? { ...j, ...patch } : j));
    }

    set({ jobs: nextJobs });
    persist(nextJobs);
  },

  duplicateJob: async (id) => {
    const source = get().jobs.find((j) => j.id === id);
    if (!source) return null;

    const copy: EmployerJob = {
      ...source,
      id: `job_${Date.now()}`,
      title: `${source.title} (Copy)`,
      hired: 0,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    const created = await createJob(buildPayloadFromPatch(source, { title: copy.title })).catch(
      () => null
    );
    if (created) {
      const finalCopy = toEmployerJob(created);
      const jobs = [finalCopy, ...get().jobs];
      set({ jobs });
      persist(jobs);
      return finalCopy.id;
    }

    const jobs = [copy, ...get().jobs];
    set({ jobs });
    persist(jobs);
    return copy.id;
  },

  bumpHired: async (id) => {
    const job = get().jobs.find((j) => j.id === id);
    if (!job) return;
    const hired = Math.min(job.hired + 1, job.workersRequired);
    const patched = get().jobs.map((j) =>
      j.id === id ? { ...j, hired } : j
    );
    set({ jobs: patched });
    persist(patched);

    updateJobApi(id, { workersAccepted: hired }).catch(() => {});
    if (job.status === 'OPEN') {
      updateJobApi(id, { status: 'FILLED' }).catch(() => {});
    }
  },

  removeJob: async (id) => {
    const existing = get().jobs.find((j) => j.id === id);
    if (!existing) return 'Job not found.';
    try {
      const result = await deleteJob(id);
      if (result.job) {
        const nextJobs = get().jobs.map((j) =>
          j.id === id ? { ...j, status: 'CLOSED' as JobStatus } : j
        );
        set({ jobs: nextJobs });
        persist(nextJobs);
        return 'Job closed (it has existing applications).';
      }
      const nextJobs = get().jobs.filter((j) => j.id !== id);
      set({ jobs: nextJobs });
      persist(nextJobs);
      return result.message ?? 'Job deleted.';
    } catch (e: any) {
      const nextJobs = get().jobs.filter((j) => j.id !== id);
      set({ jobs: nextJobs });
      persist(nextJobs);
      return e?.message || 'Job removed locally.';
    }
  },

  loadStoredJobs: async () => {
    try {
      const raw = await AsyncStorage.getItem(EMPLOYER_JOBS_STORAGE_KEY);
      if (raw) {
        set({ jobs: JSON.parse(raw) as EmployerJob[] });
      }
    } catch (e) {
      console.error('Failed to read employer jobs from storage:', e);
    }

    set({ loading: true });
    try {
      const serverJobs = await getMyJobs();
      set({ jobs: serverJobs.map(toEmployerJob), loading: false });
      persist(serverJobs.map(toEmployerJob));
    } catch (e: any) {
      console.warn('loadStoredJobs failed:', e?.message);
      set({ loading: false });
    }
  },
}));

function buildPayloadFromPatch(
  existing: EmployerJob,
  patch: Partial<Omit<EmployerJob, 'id' | 'createdAt'>>
): CreateJobPayload {
  return buildPayload({
    title: patch.title ?? existing.title,
    category: patch.category ?? existing.category,
    location: patch.location ?? existing.location,
    salaryPerDay: patch.salaryPerDay ?? existing.salaryPerDay,
    workersRequired: patch.workersRequired ?? existing.workersRequired,
    foodProvided: patch.foodProvided ?? existing.foodProvided,
    transportProvided: patch.transportProvided ?? existing.transportProvided,
    date: patch.date ?? existing.date,
  });
}