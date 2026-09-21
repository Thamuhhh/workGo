import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/api';

export interface WalletTxn {
  id: string;
  title: string;
  meta: string;
  amount: number; // positive credit, negative debit
  timestamp: string;
}

interface WalletState {
  balance: number;
  totalEarned: number;
  upiId: string;
  transactions: WalletTxn[];
  loading: boolean;
  addMoney: (amount: number) => Promise<boolean>;
  withdraw: () => Promise<boolean>;
  setUpiId: (id: string) => void;
  loadStoredWallet: () => Promise<void>;
}

const WALLET_STORAGE_KEY = '@workgo_wallet';

interface ServerWallet {
  id: string;
  balance: number;
  totalEarned: number;
  upiId: string;
  transactions: WalletTxn[];
}

const applyWallet = (set: (patch: Partial<WalletState>) => void, w: ServerWallet) => {
  set({
    balance: w.balance ?? 0,
    totalEarned: w.totalEarned ?? 0,
    upiId: w.upiId ?? '',
    transactions: (w.transactions ?? [])
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  });
  // Merge only persisted wallet fields so loadStoredWallet cache stays in one shape.
};

const getWalletFromServer = async (): Promise<ServerWallet | null> => {
  try {
    const { data } = await apiClient.get('/wallet');
    return data?.wallet ?? null;
  } catch {
    return null;
  }
};

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  totalEarned: 0,
  upiId: '',
  transactions: [],
  loading: false,

  addMoney: async (amount) => {
    try {
      const { data } = await apiClient.post('/wallet/add', { amount });
      if (data?.wallet) {
        applyWallet(set, data.wallet);
        AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(get())).catch(() => {});
        return true;
      }
    } catch (e: any) {
      console.warn('addMoney failed:', e?.message);
    }
    return false;
  },

  withdraw: async () => {
    if (get().balance <= 0) return false;
    try {
      const { data } = await apiClient.post('/wallet/withdraw');
      if (data?.wallet) {
        applyWallet(set, data.wallet);
        AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(get())).catch(() => {});
        return true;
      }
    } catch (e: any) {
      console.warn('withdraw failed:', e?.message);
    }
    return false;
  },

  setUpiId: (id) => {
    set({ upiId: id });
    apiClient.patch('/wallet/upi', { upiId: id }).catch(() => {});
    AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(get())).catch(() => {});
  },

  loadStoredWallet: async () => {
    try {
      const raw = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          balance: parsed.balance ?? 0,
          totalEarned: parsed.totalEarned ?? 0,
          upiId: parsed.upiId ?? '',
          transactions: parsed.transactions ?? [],
        });
      }
    } catch (e) {
      console.error('Failed to read wallet from storage:', e);
    }

    const server = await getWalletFromServer();
    if (server) {
      applyWallet(set, server);
      AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(get())).catch(() => {});
    }
  },
}));

export function formatINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function parseSalary(salary: string) {
  const match = salary.replace(/[,]/g, '').match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}