import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyForJob, fetchMyApplications, updateApplicationStatus } from '../services/applications';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface Application {
  id?: string;
  jobId: string;
  jobTitle?: string;
  employerName?: string;
  salaryNum?: number;
  appliedAt: string;
  status: ApplicationStatus;
  completedAt?: string;
}

interface ApplicationsState {
  applications: Application[];
  apply: (jobId: string) => Promise<void>;
  markCompleted: (jobId: string) => void;
  setApplicationStatus: (jobId: string, status: ApplicationStatus) => void;
  hasApplied: (jobId: string) => boolean;
  loadStoredApplications: () => Promise<void>;
  loadApplications: () => Promise<void>;
}

const APPLICATIONS_STORAGE_KEY = '@workgo_applications';

const persist = (applications: Application[]) => {
  AsyncStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications)).catch((e) =>
    console.error('Failed to persist application:', e)
  );
};

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],

  apply: async (jobId: string) => {
    const existing = get().applications.some((a) => a.jobId === jobId);
    if (existing) {
      return;
    }
    const created = await applyForJob(jobId);
    const application: Application = {
      id: created?.id,
      jobId,
      jobTitle: created?.jobTitle,
      employerName: created?.employerName,
      salaryNum: created?.salaryNum,
      appliedAt: created?.appliedAt ?? new Date().toISOString(),
      status: 'APPLIED',
    };
    const applications = [...get().applications, application];
    set({ applications });
    persist(applications);
  },

  hasApplied: (jobId: string) => get().applications.some((a) => a.jobId === jobId),

  markCompleted: (jobId: string) => {
    const current = get().applications.find((a) => a.jobId === jobId);
    if (!current || current.status === 'COMPLETED') return;
    if (current.id) updateApplicationStatus(current.id, 'COMPLETED');
    const applications = get().applications.map((a) =>
      a.jobId === jobId
        ? { ...a, status: 'COMPLETED' as const, completedAt: new Date().toISOString() }
        : a
    );
    set({ applications });
    persist(applications);
  },

  setApplicationStatus: (jobId: string, status: ApplicationStatus) => {
    const target = get().applications.find((a) => a.jobId === jobId);
    if (!target || target.status === status) return;
    if (target.id && status !== 'COMPLETED') {
      updateApplicationStatus(target.id, status);
    }
    const applications = get().applications.map((a) =>
      a.jobId === jobId ? { ...a, status } : a
    );
    set({ applications });
    persist(applications);
  },

  loadStoredApplications: async () => {
    try {
      const raw = await AsyncStorage.getItem(APPLICATIONS_STORAGE_KEY);
      if (raw) {
        set({ applications: JSON.parse(raw) as Application[] });
      }
    } catch (e) {
      console.error('Failed to read applications from storage:', e);
    }
  },

  loadApplications: async () => {
    try {
      const serverApps = await fetchMyApplications();
      const apps: Application[] = serverApps.map((s) => ({
        id: s.id,
        jobId: s.jobId,
        jobTitle: s.jobTitle,
        employerName: s.employerName,
        salaryNum: s.salaryNum,
        appliedAt: s.appliedAt,
        status: (s.status === 'CANCELLED' ? 'REJECTED' : s.status) as ApplicationStatus,
      }));
      if (apps.length > 0) {
        set({ applications: apps });
        persist(apps);
      } else {
        set({ applications: [] });
        persist([]);
      }
    } catch {
      // Offline — keep the locally cached list.
    }
  },
}));