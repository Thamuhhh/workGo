import apiClient from './api';

export interface ServerJob {
  id: string;
  title: string;
  category: string;
  description: string;
  employerName: string;
  employerRating: string;
  location: string;
  city: string;
  latitude: number;
  longitude: number;
  distance: string;
  date: string;
  rawDate: string;
  timing: string;
  workersRequired: number;
  workersAccepted: number;
  salary: string;
  salaryNum: number;
  foodProvided: boolean;
  transportProvided: boolean;
  requirements: string;
  status: string;
}

export interface EmployerJobDTO extends ServerJob {
  // server returns same shape; employer status mapping done in store
}

export interface CreateJobPayload {
  title: string;
  category: string;
  description?: string;
  location: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  date: string;
  startTime?: string;
  endTime?: string;
  salary: number;
  workersRequired?: number;
  foodProvided?: boolean;
  transportProvided?: boolean;
  skills?: string[];
}

export interface GetJobsFilter {
  lat?: number;
  lng?: number;
  q?: string;
  category?: string;
  city?: string;
  page?: number;
  limit?: number;
}

export async function getJobs(filter?: GetJobsFilter): Promise<ServerJob[]> {
  const params: Record<string, string> = {};
  if (filter?.lat !== undefined && filter?.lng !== undefined) {
    params.lat = String(filter.lat);
    params.lng = String(filter.lng);
  }
  if (filter?.q) params.q = filter.q;
  if (filter?.category) params.category = filter.category;
  if (filter?.city) params.city = filter.city;
  if (filter?.page) params.page = String(filter.page);
  if (filter?.limit) params.limit = String(filter.limit);
  const { data } = await apiClient.get('/jobs', { params });
  return data.jobs ?? [];
}

export async function getJobCategories(): Promise<string[]> {
  const { data } = await apiClient.get('/jobs/categories');
  return data.categories ?? [];
}

export async function getJob(id: string, lat?: number, lng?: number): Promise<ServerJob | null> {
  try {
    const params: Record<string, string> = {};
    if (lat !== undefined && lng !== undefined) {
      params.lat = String(lat);
      params.lng = String(lng);
    }
    const { data } = await apiClient.get(`/jobs/${id}`, { params });
    return data.job ?? null;
  } catch {
    return null;
  }
}

export async function getMyJobs(lat?: number, lng?: number): Promise<ServerJob[]> {
  const params: Record<string, string> = {};
  if (lat !== undefined && lng !== undefined) {
    params.lat = String(lat);
    params.lng = String(lng);
  }
  const { data } = await apiClient.get('/jobs/mine', { params });
  return data.jobs ?? [];
}

export async function createJob(payload: CreateJobPayload): Promise<ServerJob | null> {
  try {
    const { data } = await apiClient.post('/jobs', payload);
    return data.job ?? null;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || 'Failed to create job.');
  }
}

export async function updateJob(
  id: string,
  patch: Partial<CreateJobPayload> & { workersAccepted?: number; status?: string }
): Promise<ServerJob | null> {
  try {
    const { data } = await apiClient.patch(`/jobs/${id}`, patch);
    return data.job ?? null;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || 'Failed to update job.');
  }
}

export async function deleteJob(id: string): Promise<{ message: string; job?: ServerJob }> {
  const { data } = await apiClient.delete(`/jobs/${id}`);
  return data;
}