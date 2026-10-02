import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AREA_COORDS } from '../services/location';

interface LocationState {
  label: string;
  address: string;
  lat: number;
  lng: number;
  setLocation: (label: string, address: string, lat?: number, lng?: number) => void;
  clearLocation: () => void;
}

const DEFAULT_COORDS = AREA_COORDS['Kanchipuram'] ?? [79.7, 12.8352];

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      label: 'Home',
      address: 'Gandhi Road, Kanchipuram',
      lat: DEFAULT_COORDS[1],
      lng: DEFAULT_COORDS[0],
      setLocation: (label, address, lat, lng) =>
        set((s) => ({
          label,
          address,
          lat: lat ?? s.lat,
          lng: lng ?? s.lng,
        })),
      clearLocation: () =>
        set({ label: 'Home', address: 'Gandhi Road, Kanchipuram', lat: DEFAULT_COORDS[1], lng: DEFAULT_COORDS[0] }),
    }),
    {
      name: '@workgo_location',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);