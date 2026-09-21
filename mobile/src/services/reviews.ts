import apiClient from './api';

export interface ServerReview {
  id: string;
  jobId: string;
  targetId: string;
  rating: number;
  tags: string[];
  comment: string;
  created: string;
  authorName: string;
  authorPhoto: string;
}

export async function createReview(payload: {
  jobId: string;
  rating: number;
  tags?: string[];
  comment?: string;
  workerId?: string;
}): Promise<ServerReview | null> {
  try {
    const { data } = await apiClient.post('/reviews', payload);
    return data.review ?? null;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || 'Failed to save review.');
  }
}

export async function getJobReviews(jobId: string): Promise<{
  reviews: ServerReview[];
  rating: { avg: number; total: number } | null;
}> {
  const { data } = await apiClient.get(`/reviews/job/${jobId}`);
  return {
    reviews: data.reviews ?? [],
    rating: data.rating ?? null,
  };
}

export async function getMyReviews(): Promise<{
  written: ServerReview[];
  received: ServerReview[];
}> {
  const { data } = await apiClient.get('/reviews/me');
  return {
    written: data.written ?? [],
    received: data.received ?? [],
  };
}