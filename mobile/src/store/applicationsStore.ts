import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface Application {
  jobId: string;
  appliedAt: string;
  status: ApplicationStatus;
  completedAt?: string;
}

interface ApplicationsState {
  applications: Application[];
  apply: (jobId: string) => Promise<void>;
  markCompleted: (jobId: string) => void;
  hasApplied: (jobId: string) => boolean;
  loadStoredApplications: () => Promise<void>;
}

const APPLICATIONS_STORAGE_KEY = '@workgo_applications';

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],

  apply: async (jobId: string) => {
    const existing = get().applications.some((a) => a.jobId === jobId);
    if (existing) {
      return;
    }
    const application: Application = {
      jobId,
      appliedAt: new Date().toISOString(),
      status: 'APPLIED',
    };
    const applications = [...get().applications, application];
    set({ applications });
    try {
      await AsyncStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
    } catch (e) {
      console.error('Failed to persist application:', e);
    }
  },

  hasApplied: (jobId: string) => get().applications.some((a) => a.jobId === jobId),

  markCompleted: (jobId: string) => {
    const current = get().applications.find((a) => a.jobId === jobId);
    if (!current || current.status === 'COMPLETED') return;
    const applications = get().applications.map((a) =>
      a.jobId === jobId
        ? { ...a, status: 'COMPLETED' as const, completedAt: new Date().toISOString() }
        : a
    );
    set({ applications });
    AsyncStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications)).catch((e) =>
      console.error('Failed to persist application:', e)
    );
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
}));