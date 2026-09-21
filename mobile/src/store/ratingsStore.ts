import { create } from 'zustand';
import { createReview, getMyReviews, ServerReview } from '../services/reviews';

export interface JobRating {
  jobId: string;
  stars: number;
  tags: string[];
  comment: string;
  createdAt: string;
}

export const RATING_TAGS = [
  'Paid on time',
  'Clear instructions',
  'Good behaviour',
  'On-time reach',
  'Professional',
  'Friendly workplace',
  'Late payment',
  'Poor instructions',
] as const;

interface RatingsState {
  ratings: Record<string, JobRating>; // my reviews (jobId → review)
  received: Record<string, JobRating>; // reviews I received (jobId → review)
  rateJob: (jobId: string, stars: number, tags: string[], comment: string) => Promise<void>;
  loadStoredRatings: () => Promise<void>;
}

const toJobRating = (r: ServerReview, stars: number): JobRating => ({
  jobId: r.jobId,
  stars,
  tags: r.tags ?? [],
  comment: r.comment ?? '',
  createdAt: r.created,
});

export const useRatingsStore = create<RatingsState>((set, get) => ({
  ratings: {},
  received: {},

  rateJob: async (jobId: string, stars: number, tags: string[], comment: string) => {
    const optimistic: JobRating = {
      jobId,
      stars,
      tags,
      comment,
      createdAt: new Date().toISOString(),
    };
    set({ ratings: { ...get().ratings, [jobId]: optimistic } });
    try {
      const saved = await createReview({ jobId, rating: stars, tags, comment });
      if (saved) {
        set({
          ratings: { ...get().ratings, [jobId]: toJobRating(saved, saved.rating) },
        });
      }
    } catch (e: any) {
      throw new Error(e?.message || 'Failed to save rating.');
    }
  },

  loadStoredRatings: async () => {
    try {
      const { written, received } = await getMyReviews();
      const ratings: Record<string, JobRating> = {};
      written.forEach((r) => {
        ratings[r.jobId] = toJobRating(r, r.rating);
      });
      const receivedMap: Record<string, JobRating> = {};
      received.forEach((r) => {
        receivedMap[r.jobId] = toJobRating(r, r.rating);
      });
      set({ ratings, received: receivedMap });
    } catch (e) {
      console.warn('Failed to load reviews:', e);
    }
  },
}));