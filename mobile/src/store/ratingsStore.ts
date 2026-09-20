import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  ratings: Record<string, JobRating>; // worker → employer
  received: Record<string, JobRating>; // employer → worker
  rateJob: (jobId: string, stars: number, tags: string[], comment: string) => Promise<void>;
  loadStoredRatings: () => Promise<void>;
}

const RATINGS_STORAGE_KEY = '@workgo_ratings_v2';

const WORKER_FEEDBACK = ['Punctual', 'Good work quality', 'Polite', 'Reliable', 'Great attitude'];

export const useRatingsStore = create<RatingsState>((set, get) => ({
  ratings: {},
  received: {},

  rateJob: async (jobId: string, stars: number, tags: string[], comment: string) => {
    const rating: JobRating = {
      jobId,
      stars,
      tags,
      comment,
      createdAt: new Date().toISOString(),
    };
    // Simulate the employer rating the worker back after work completion.
    const receivedStars = stars >= 4 ? 5 : 4;
    const pick = (arr: string[], n: number) =>
      [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    const receivedRating: JobRating = {
      jobId,
      stars: receivedStars,
      tags: pick(WORKER_FEEDBACK, 3),
      comment: '',
      createdAt: new Date(Date.now() + 60000).toISOString(),
    };
    const ratings = { ...get().ratings, [jobId]: rating };
    const received = { ...get().received, [jobId]: receivedRating };
    set({ ratings, received });
    try {
      await AsyncStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify({ ratings, received }));
    } catch (e) {
      console.error('Failed to persist rating:', e);
    }
  },

  loadStoredRatings: async () => {
    try {
      const raw = await AsyncStorage.getItem(RATINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.ratings && parsed.received) {
          set({ ratings: parsed.ratings, received: parsed.received });
        }
      }
    } catch (e) {
      console.error('Failed to read ratings from storage:', e);
    }
  },
}));