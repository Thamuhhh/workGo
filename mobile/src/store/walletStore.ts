import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  credit: (title: string, meta: string, amount: number) => void;
  addMoney: (amount: number) => void;
  withdraw: () => boolean;
  setUpiId: (id: string) => void;
  loadStoredWallet: () => Promise<void>;
}

const WALLET_STORAGE_KEY = '@workgo_wallet';

const mins = (n: number) => new Date(Date.now() - n * 60000).toISOString();
const hours = (n: number) => new Date(Date.now() - n * 3600000).toISOString();

const SEED_TXNS: WalletTxn[] = [
  { id: 't1', title: 'Catering Helper — Day job', meta: 'Sharon Catering • 10:42 AM', amount: 800, timestamp: hours(8) },
  { id: 't2', title: 'Retail Promoter — Store', meta: 'BigMart • 08:15 AM', amount: 750, timestamp: hours(11) },
  { id: 't3', title: 'Instant withdrawal to UPI', meta: 'arun*****@okhdfc • yesterday', amount: -500, timestamp: hours(25) },
  { id: 't4', title: 'Event Support — Weekend', meta: 'RPS Events • Sep 12', amount: 1200, timestamp: hours(30) },
  { id: 't5', title: 'Service fee', meta: 'Gigro • Sep 12', amount: -20, timestamp: mins(1800) },
];

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 2430,
  totalEarned: 2750,
  upiId: 'arun*****@okhdfc',
  transactions: SEED_TXNS,

  credit: (title, meta, amount) => {
    const txn: WalletTxn = {
      id: `t${Date.now()}`,
      title,
      meta,
      amount,
      timestamp: new Date().toISOString(),
    };
    const s = get();
    set({
      transactions: [txn, ...s.transactions],
      balance: s.balance + amount,
      totalEarned: s.totalEarned + amount,
    });
    AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(get())).catch(() => {});
  },

  addMoney: (amount) => {
    const txn: WalletTxn = {
      id: `t${Date.now()}`,
      title: 'Added to wallet',
      meta: 'Instant UPI • Demo',
      amount,
      timestamp: new Date().toISOString(),
    };
    const s = get();
    set({ transactions: [txn, ...s.transactions], balance: s.balance + amount });
    AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(get())).catch(() => {});
  },

  withdraw: () => {
    const s = get();
    if (s.balance <= 0) return false;
    const txn: WalletTxn = {
      id: `t${Date.now()}`,
      title: 'Instant withdrawal to UPI',
      meta: s.upiId,
      amount: -s.balance,
      timestamp: new Date().toISOString(),
    };
    set({ transactions: [txn, ...s.transactions], balance: 0 });
    AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(get())).catch(() => {});
    return true;
  },

  setUpiId: (id) => set({ upiId: id }),

  loadStoredWallet: async () => {
    try {
      const raw = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          balance: parsed.balance ?? 2430,
          totalEarned: parsed.totalEarned ?? 2750,
          upiId: parsed.upiId ?? 'arun*****@okhdfc',
          transactions: parsed.transactions ?? SEED_TXNS,
        });
      }
    } catch (e) {
      console.error('Failed to read wallet from storage:', e);
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