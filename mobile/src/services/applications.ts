import apiClient from './api';

export type ServerAppStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

interface ServerApplicationBase {
  id: string;
  jobId: string;
  jobTitle: string;
  employerName: string;
  salaryNum: number;
  workerId?: string;
  workerName: string;
  workerArea: string;
  status: ServerAppStatus;
  appliedAt: string;
}

export interface ServerApplication extends ServerApplicationBase {}
export interface HiredWorkerDTO extends ServerApplicationBase {}

export async function applyForJob(jobId: string): Promise<ServerApplication | null> {
  try {
    const { data } = await apiClient.post('/applications', { jobId });
    return data.application ?? null;
  } catch {
    return null;
  }
}

export async function fetchMyApplications(): Promise<ServerApplication[]> {
  const { data } = await apiClient.get('/applications/mine');
  return data.applications ?? [];
}

export async function fetchHiredWorkers(): Promise<HiredWorkerDTO[]> {
  const { data } = await apiClient.get('/applications/hired');
  return data.applications ?? [];
}

export async function updateApplicationStatus(
  id: string,
  status: ServerAppStatus
): Promise<ServerApplication | null> {
  try {
    const { data } = await apiClient.patch(`/applications/${id}`, { status });
    return data.application ?? null;
  } catch {
    return null;
  }
}