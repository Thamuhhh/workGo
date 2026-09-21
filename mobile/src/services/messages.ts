import apiClient from './api';

export interface ServerMessage {
  id: string;
  jobId: string;
  sender: string;
  senderRole: 'worker' | 'employer';
  text: string;
  read: boolean;
  timestamp: string;
}

export interface ThreadDTO {
  jobId: string;
  jobTitle: string;
  otherName: string;
  otherRole: 'worker' | 'employer';
  otherPhone: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
}

export async function fetchThreads(): Promise<ThreadDTO[]> {
  const { data } = await apiClient.get('/messages/threads');
  return data.threads ?? [];
}

export async function fetchThread(jobId: string): Promise<ServerMessage[]> {
  const { data } = await apiClient.get(`/messages/${jobId}`);
  return data.messages ?? [];
}

export async function sendServerMessage(
  jobId: string,
  text: string,
  workerId?: string
): Promise<ServerMessage | null> {
  try {
    const { data } = await apiClient.post(`/messages/${jobId}`, { text, workerId });
    return data.message ?? null;
  } catch {
    return null;
  }
}

export async function markThreadReadServer(jobId: string): Promise<void> {
  try {
    await apiClient.patch(`/messages/${jobId}/read`);
  } catch {
    // best effort
  }
}

export async function readAllThreadsServer(): Promise<void> {
  try {
    await apiClient.get('/messages/read-all');
  } catch {
    // best effort
  }
}