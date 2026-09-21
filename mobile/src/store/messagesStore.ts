import { create } from 'zustand';
import {
  fetchThreads,
  fetchThread,
  sendServerMessage,
  markThreadReadServer,
  ThreadDTO,
} from '../services/messages';

export interface ChatMessage {
  id: string;
  sender: 'worker' | 'employer';
  text: string;
  timestamp: string; // ISO
}

export interface ThreadMeta {
  jobId: string;
  jobTitle: string;
  otherName: string;
  otherRole: 'worker' | 'employer';
  otherPhone: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
}

interface MessagesState {
  threads: Record<string, ChatMessage[]>;
  threadMeta: Record<string, ThreadMeta>;
  readThreadIds: string[];
  loadThreads: () => Promise<void>;
  loadThread: (jobId: string) => Promise<void>;
  sendMessage: (jobId: string, text: string, sender?: 'worker' | 'employer', workerId?: string) => Promise<void>;
  markThreadRead: (jobId: string) => void;
  markAllRead: (jobIds: string[]) => void;
}

const toChatMessage = (m: any): ChatMessage => ({
  id: m.id,
  sender: m.senderRole === 'employer' ? 'employer' : 'worker',
  text: m.text,
  timestamp: m.timestamp,
});

export const useMessagesStore = create<MessagesState>((set, get) => ({
  threads: {},
  threadMeta: {},
  readThreadIds: [],

  loadThreads: async () => {
    try {
      const list = await fetchThreads();
      const meta: Record<string, ThreadMeta> = {};
      list.forEach((t) => {
        meta[t.jobId] = t;
      });
      const alreadyRead = list.filter((t) => t.unread === 0).map((t) => t.jobId);
      set((s) => ({
        threadMeta: meta,
        readThreadIds: Array.from(new Set([...s.readThreadIds, ...alreadyRead])),
      }));
    } catch {
      // server unavailable; keep cached threads
    }
  },

  loadThread: async (jobId: string) => {
    try {
      const messages = await fetchThread(jobId);
      set((s) => ({
        threads: { ...s.threads, [jobId]: messages.map(toChatMessage) },
        readThreadIds: Array.from(new Set([...s.readThreadIds, jobId])),
      }));
      markThreadReadServer(jobId);
    } catch {
      // server unavailable; keep cached thread
    }
  },

  sendMessage: async (jobId: string, text: string, sender: 'worker' | 'employer' = 'worker', workerId?: string) => {
    const message: ChatMessage = {
      id: `m${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      threads: { ...s.threads, [jobId]: [...(s.threads[jobId] ?? []), message] },
    }));
    const saved = await sendServerMessage(jobId, text, workerId);
    if (saved) {
      set((s) => ({
        threads: {
          ...s.threads,
          [jobId]: (s.threads[jobId] ?? []).map((m) => (m.id === message.id ? { ...m, id: saved.id } : m)),
        },
      }));
    }
  },

  markThreadRead: (jobId: string) => {
    if (!get().readThreadIds.includes(jobId)) {
      set((s) => ({ readThreadIds: [...s.readThreadIds, jobId] }));
    }
    markThreadReadServer(jobId);
  },

  markAllRead: (jobIds: string[]) => {
    set((s) => ({
      readThreadIds: Array.from(new Set([...s.readThreadIds, ...jobIds])),
    }));
    jobIds.forEach((id) => markThreadReadServer(id));
  },
}));