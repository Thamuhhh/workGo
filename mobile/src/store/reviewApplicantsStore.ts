import { create } from 'zustand';
import { useApplicationsStore, ApplicationStatus } from './applicationsStore';
import { useMessagesStore } from './messagesStore';
import { useEmployerJobsStore } from './employerJobsStore';
import { useJobsStore } from './jobsStore';
import { fetchMyApplications, updateApplicationStatus } from '../services/applications';

export interface ReviewApplicant {
  id: string;
  name: string;
  service: string;
  area: string;
  jobId: string;
  workerId?: string;
  status: ApplicationStatus;
}

interface ReviewApplicantsState {
  applicants: ReviewApplicant[];
  loading: boolean;
  loadApplicants: () => Promise<void>;
  review: (id: string, action: 'accept' | 'reject') => void;
}

const jobTitle = (jobId: string) =>
  useEmployerJobsStore.getState().jobs.find((j) => j.id === jobId)?.title ??
  useJobsStore.getState().jobs.find((j) => j.id === jobId)?.title ??
  'the job';

const normalizeStatus = (raw: string): ApplicationStatus =>
  raw === 'CANCELLED' ? 'REJECTED' : (raw as ApplicationStatus);

export const useReviewApplicantsStore = create<ReviewApplicantsState>((set, get) => ({
  applicants: [],
  loading: false,

  loadApplicants: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const serverApps = await fetchMyApplications();
      const applicants: ReviewApplicant[] = serverApps.map((s) => ({
        id: s.id,
        name: s.workerName,
        service: s.jobTitle,
        area: s.workerArea,
        jobId: s.jobId,
        workerId: s.workerId,
        status: normalizeStatus(s.status),
      }));
      set({ applicants, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  review: (id: string, action: 'accept' | 'reject') => {
    const applicant = get().applicants.find((a) => a.id === id);
    if (!applicant || (applicant.status !== 'APPLIED' && applicant.status !== 'SHORTLISTED')) return;

    const status: ApplicationStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
    const title = jobTitle(applicant.jobId);

    set((s) => ({
      applicants: s.applicants.map((a) => (a.id === id ? { ...a, status } : a)),
    }));

    updateApplicationStatus(id, status);

    useApplicationsStore.getState().setApplicationStatus(applicant.jobId, status);
    if (action === 'accept') {
      useEmployerJobsStore.getState().bumpHired(applicant.jobId);
    }

    const messages = useMessagesStore.getState();
    if (action === 'accept') {
      useApplicationsStore.getState().setApplicationStatus(applicant.jobId, status);
      useEmployerJobsStore.getState().bumpHired(applicant.jobId);
    } else {
      messages.sendMessage(
        applicant.jobId,
        `Hi ${applicant.name.split(' ')[0]}, we're sorry but we've moved ahead with other candidates for ${title}. We'll keep you in mind for future gigs.`,
        'employer',
        applicant.workerId
      );
    }
  },
}));