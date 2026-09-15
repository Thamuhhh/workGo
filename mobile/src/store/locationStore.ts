import { create } from 'zustand';

interface LocationState {
  label: string;
  address: string;
  setLocation: (label: string, address: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  label: 'Home',
  address: 'Gandhi Road, Kanchipuram',
  setLocation: (label, address) => set({ label, address }),
}));