import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface EmployerJobsState {
  jobs: EmployerJob[];
  addJob: (job: Omit<EmployerJob, 'id' | 'hired' | 'status' | 'createdAt'>) => Promise<void>;
  updateJob: (id: string, patch: Partial<Omit<EmployerJob, 'id' | 'createdAt'>>) => Promise<void>;
  duplicateJob: (id: string) => Promise<string | null>;
  bumpHired: (id: string) => Promise<void>;
  loadStoredJobs: () => Promise<void>;
}

function persist(jobs: EmployerJob[]) {
  try {
    AsyncStorage.setItem(EMPLOYER_JOBS_STORAGE_KEY, JSON.stringify(jobs)).catch((e) =>
      console.error('Failed to persist employer job:', e)
    );
  } catch (e) {
    console.error('Failed to persist employer job:', e);
  }
}

const EMPLOYER_JOBS_STORAGE_KEY = '@workgo_employer_jobs';

const SEED_JOBS: EmployerJob[] = [
  {
    id: 'seed_job_1',
    title: 'Wedding Catering Staff',
    category: 'Catering',
    workersRequired: 15,
    salaryPerDay: 900,
    foodProvided: true,
    transportProvided: true,
    date: '20 September',
    location: 'Kanchipuram',
    hired: 12,
    status: 'FILLING',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'seed_job_2',
    title: 'Banquet Cleaning Staff',
    category: 'Cleaner',
    workersRequired: 8,
    salaryPerDay: 850,
    foodProvided: true,
    transportProvided: false,
    date: 'Tomorrow',
    location: 'Gandhi Road',
    hired: 0,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const useEmployerJobsStore = create<EmployerJobsState>((set, get) => ({
  jobs: SEED_JOBS,

  addJob: async (input) => {
    const job: EmployerJob = {
      ...input,
      id: `job_${Date.now()}`,
      hired: 0,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    const jobs = [job, ...get().jobs];
    set({ jobs });
    persist(jobs);
  },

  updateJob: async (id, patch) => {
    const jobs = get().jobs.map((j) => (j.id === id ? { ...j, ...patch } : j));
    set({ jobs });
    persist(jobs);
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
    const jobs = [copy, ...get().jobs];
    set({ jobs });
    persist(jobs);
    return copy.id;
  },

  bumpHired: async (id) => {
    const job = get().jobs.find((j) => j.id === id);
    if (!job) return;
    const patched = get().jobs.map((j) =>
      j.id === id ? { ...j, hired: Math.min(j.hired + 1, j.workersRequired) } : j
    );
    set({ jobs: patched });
    persist(patched);
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
  },
}));