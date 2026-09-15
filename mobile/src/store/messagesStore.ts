import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  sender: 'worker' | 'employer';
  text: string;
  timestamp: string; // ISO
}

function buildDemoThread(): ChatMessage[] {
  const mins = (n: number) => new Date(Date.now() - n * 60000).toISOString();
  return [
    { id: 'm1', sender: 'employer', text: 'Hi! Thanks for applying to the job.', timestamp: mins(45) },
    { id: 'm2', sender: 'employer', text: 'Can you join tomorrow by 9:00 AM?', timestamp: mins(44) },
    { id: 'm3', sender: 'worker', text: 'Yes, I will be there on time.', timestamp: mins(35) },
    { id: 'm4', sender: 'employer', text: 'Perfect! Please carry an ID proof.', timestamp: mins(30) },
    { id: 'm5', sender: 'employer', text: 'We need you by 9 AM tomorrow. Confirm?', timestamp: mins(2) },
  ];
}

interface MessagesState {
  threads: Record<string, ChatMessage[]>;
  readThreadIds: string[];
  seedThread: (jobId: string) => void;
  sendMessage: (jobId: string, text: string) => void;
  markThreadRead: (jobId: string) => void;
  markAllRead: (jobIds: string[]) => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  threads: {},
  readThreadIds: [],

  seedThread: (jobId: string) => {
    if (get().threads[jobId]) return;
    set((s) => ({
      threads: { ...s.threads, [jobId]: buildDemoThread() },
    }));
  },

  sendMessage: (jobId: string, text: string) => {
    const message: ChatMessage = {
      id: `m${Date.now()}`,
      sender: 'worker',
      text,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      threads: { ...s.threads, [jobId]: [...(s.threads[jobId] ?? []), message] },
    }));
  },

  markThreadRead: (jobId: string) =>
    set((s) =>
      s.readThreadIds.includes(jobId)
        ? s
        : { readThreadIds: [...s.readThreadIds, jobId] }
    ),

  markAllRead: (jobIds: string[]) =>
    set((s) => ({
      readThreadIds: Array.from(new Set([...s.readThreadIds, ...jobIds])),
    })),
}));