import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PaymentStatus = 'PENDING' | 'PAID';

export interface Payment {
  id: string;
  jobId: string;
  title: string;
  workerName: string;
  employerName: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  txnId?: string;
  createdAt: string;
  paidAt?: string;
}

const PAYMENTS_STORAGE_KEY = '@workgo_payments';

function makeTxnId() {
  return `TXN${Date.now().toString().slice(-9)}${Math.floor(Math.random() * 90 + 10)}`;
}

interface PaymentsState {
  payments: Payment[];
  createPayment: (data: {
    jobId: string;
    title: string;
    workerName: string;
    employerName: string;
    amount: number;
  }) => Payment;
  payPayment: (id: string, method: string) => void;
  paymentForJob: (jobId: string) => Payment | undefined;
  loadStoredPayments: () => Promise<void>;
}

export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  payments: [],

  createPayment: (data) => {
    const existing = get().payments.find((p) => p.jobId === data.jobId);
    if (existing) return existing;

    const payment: Payment = {
      id: `p${Date.now()}`,
      jobId: data.jobId,
      title: data.title,
      workerName: data.workerName,
      employerName: data.employerName,
      amount: data.amount,
      method: '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    const payments = [payment, ...get().payments];
    set({ payments });
    AsyncStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments)).catch(() => {});
    return payment;
  },

  payPayment: (id, method) => {
    const target = get().payments.find((p) => p.id === id);
    if (!target || target.status === 'PAID') return;

    const payments = get().payments.map((p) =>
      p.id === id
        ? {
            ...p,
            method,
            status: 'PAID' as const,
            txnId: makeTxnId(),
            paidAt: new Date().toISOString(),
          }
        : p
    );
    set({ payments });
    AsyncStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments)).catch(() => {});
  },

  paymentForJob: (jobId) => get().payments.find((p) => p.jobId === jobId),

  loadStoredPayments: async () => {
    try {
      const raw = await AsyncStorage.getItem(PAYMENTS_STORAGE_KEY);
      if (raw) {
        set({ payments: JSON.parse(raw) as Payment[] });
      }
    } catch (e) {
      console.error('Failed to read payments from storage:', e);
    }
  },
}));

export function formatINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}