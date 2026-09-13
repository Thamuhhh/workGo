import { create } from 'zustand';

interface MessagesState {
  readThreadIds: string[];
  markThreadRead: (jobId: string) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  readThreadIds: [],

  markThreadRead: (jobId: string) =>
    set((s) =>
      s.readThreadIds.includes(jobId)
        ? s
        : { readThreadIds: [...s.readThreadIds, jobId] }
    ),
}));