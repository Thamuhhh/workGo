import { create } from 'zustand';
import { useApplicationsStore, ApplicationStatus } from './applicationsStore';
import { useMessagesStore } from './messagesStore';
import { useNotificationsStore } from './notificationsStore';
import { useEmployerJobsStore } from './employerJobsStore';
import { SAMPLE_JOBS } from '../data/sampleJobs';

export interface ReviewApplicant {
  id: string;
  name: string;
  service: string;
  area: string;
  jobId: string;
  status: ApplicationStatus;
}

const INITIAL_APPLICANTS: ReviewApplicant[] = [
  { id: 'a1', name: 'Murugan S', service: 'Catering Staff', area: 'Kanchipuram', jobId: 'job_1', status: 'APPLIED' },
  { id: 'a2', name: 'Priya R', service: 'Event Coordinator', area: 'Chengalpattu', jobId: 'job_2', status: 'APPLIED' },
  { id: 'a3', name: 'Karthik V', service: 'MC/Anchor', area: 'Chennai', jobId: 'job_3', status: 'SHORTLISTED' },
  { id: 'a4', name: 'Santhosh K', service: 'Catering Staff', area: 'Kanchipuram', jobId: 'seed_job_1', status: 'APPLIED' },
  { id: 'a5', name: 'Divya M', service: 'Catering Staff', area: 'Chennai', jobId: 'seed_job_1', status: 'APPLIED' },
  { id: 'a6', name: 'Ravi T', service: 'Cleaner', area: 'Gandhi Road', jobId: 'seed_job_2', status: 'SHORTLISTED' },
];

interface ReviewApplicantsState {
  applicants: ReviewApplicant[];
  review: (id: string, action: 'accept' | 'reject') => void;
}

const jobTitle = (jobId: string) =>
  SAMPLE_JOBS.find((j) => j.id === jobId)?.title ??
  useEmployerJobsStore.getState().jobs.find((j) => j.id === jobId)?.title ??
  'the job';

export const useReviewApplicantsStore = create<ReviewApplicantsState>((set, get) => ({
  applicants: INITIAL_APPLICANTS,

  review: (id: string, action: 'accept' | 'reject') => {
    const applicant = get().applicants.find((a) => a.id === id);
    if (!applicant || (applicant.status !== 'APPLIED' && applicant.status !== 'SHORTLISTED')) return;

    const status: ApplicationStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
    const title = jobTitle(applicant.jobId);

    set((s) => ({
      applicants: s.applicants.map((a) => (a.id === id ? { ...a, status } : a)),
    }));

    useApplicationsStore.getState().setApplicationStatus(applicant.jobId, status);
    if (action === 'accept') {
      useEmployerJobsStore.getState().bumpHired(applicant.jobId);
    }

    const messages = useMessagesStore.getState();
    messages.seedThread(applicant.jobId);
    if (action === 'accept') {
      messages.sendMessage(
        applicant.jobId,
        `Congratulations ${applicant.name.split(' ')[0]}! Your application for ${title} has been accepted. We'll share the shift details soon.`,
        'employer'
      );
      useNotificationsStore.getState().push({
        icon: 'checkmark-circle',
        title: 'Application accepted',
        body: `Your application for ${title} has been accepted. We'll share the details soon.`,
      });
    } else {
      messages.sendMessage(
        applicant.jobId,
        `Hi ${applicant.name.split(' ')[0]}, we're sorry but we've moved ahead with other candidates for ${title}. We'll keep you in mind for future gigs.`,
        'employer'
      );
      useNotificationsStore.getState().push({
        icon: 'close-circle',
        title: 'Application rejected',
        body: `Your application for ${title} was not selected this time.`,
      });
    }
  },
}));