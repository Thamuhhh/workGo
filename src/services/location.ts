import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface AreaOption {
  label: string;
  address: string;
}

export const SAVED_PLACES = [
  { label: 'Home', address: 'Gandhi Road, Kanchipuram', icon: 'home-outline' },
  { label: 'Work', address: 'Anna Nagar, Chennai', icon: 'briefcase-outline' },
];

export const QUICK_AREAS = [
  'Kanchipuram',
  'Chengalpattu',
  'Madurantakam',
  'Sriperumbudur',
  'Uthiramerur',
  'Oragadam',
  'Maraimalai Nagar',
  'Tambaram',
];

export const AREA_JOB_COUNT: Record<string, number> = {
  Home: 34,
  Work: 27,
  Kanchipuram: 12,
  Chengalpattu: 9,
  Madurantakam: 6,
  Sriperumbudur: 14,
  Uthiramerur: 4,
  Oragadam: 11,
  'Maraimalai Nagar': 8,
  Tambaram: 21,
  'Current location': 18,
};

export const AREA_COORDS: Record<string, [number, number]> = {
  Home: [79.7, 12.8352],
  Work: [80.211, 13.0827],
  Kanchipuram: [79.7, 12.8352],
  Chengalpattu: [79.975, 12.685],
  Madurantakam: [79.8593, 12.5111],
  Sriperumbudur: [79.942, 12.967],
  Uthiramerur: [79.761, 12.608],
  Oragadam: [79.9569, 12.9111],
  'Maraimalai Nagar': [80.035, 12.793],
  Tambaram: [80.117, 12.923],
};

// Known Chennai localities — reverse geocoders return "Ward/Zone" junk,
// so we snap to the nearest real locality first.
const LOCALITY_COORDS: Record<string, [number, number]> = {
  Virugambakkam: [80.1931, 13.0502],
  Kodambakkam: [80.201, 13.053],
  Vadapalani: [80.213, 13.049],
  Valasaravakkam: [80.18, 13.06],
  Saligramam: [80.205, 13.036],
  Koyambedu: [80.201, 13.073],
  Maduravoyal: [80.156, 13.062],
  'MMDA Colony': [80.178, 13.052],
  'Anna Nagar': [80.211, 13.082],
  Mogappair: [80.178, 13.082],
  Ambattur: [80.132, 13.098],
  Poonamallee: [80.107, 13.084],
  Guindy: [80.216, 13.006],
  Nungambakkam: [80.242, 13.058],
  'T. Nagar': [80.231, 13.041],
  'West Mambalam': [80.223, 13.034],
  'Ashok Nagar': [80.217, 13.032],
  Arumbakkam: [80.219, 13.074],
  Alwarthirunagar: [80.221, 13.035],
  Porur: [80.157, 13.037],
  Ramapuram: [80.172, 13.032],
  Iyyapanthangal: [80.158, 13.028],
  'Vellala Nagar': [80.226, 13.011],
  Ekkaduthangal: [80.205, 13.015],
  Nandanam: [80.237, 13.028],
  Adyar: [80.255, 13.005],
  Teynampet: [80.246, 13.035],
  Royapettah: [80.26, 13.05],
  Mylapore: [80.27, 13.036],
  Velachery: [80.221, 12.975],
  Chromepet: [80.151, 12.952],
  Pallavaram: [80.16, 12.967],
  Tambaram: [80.117, 12.923],
  Perungudi: [80.241, 12.96],
  Thoraipakkam: [80.24, 12.934],
  Sholinganallur: [80.23, 12.901],
  OMR: [80.246, 12.97],
  Medavakkam: [80.185, 12.916],
  Madipakkam: [80.199, 12.96],
  Pallikaranai: [80.21, 12.936],
  Guduvancheri: [80.072, 12.845],
  Urapakkam: [80.095, 12.868],
  Vandalur: [80.09, 12.892],
};

export const distKm = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const la = toRad(a[1]);
  const lb = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const nearestLocality = (coords: [number, number]): string | null => {
  let best: string | null = null;
  let bestD = Infinity;
  for (const name of Object.keys(LOCALITY_COORDS)) {
    const d = distKm(coords, LOCALITY_COORDS[name]);
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  return bestD < 6 ? best : null;
};

export const reverseGeocodeName = async (
  coords: [number, number]
): Promise<string | null> => {
  const local = nearestLocality(coords);
  if (local) return local;
  const [lng, lat] = coords;
  try {
    if (Platform.OS === 'web') {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (!res.ok) return null;
      const data = await res.json();
      const admins: { name: string; adminLevel: number; order: number }[] =
        data.localityInfo?.administrative ?? [];
      const suburb =
        admins
          .filter((a) => a.adminLevel >= 7 && a.adminLevel <= 10)
          .sort((a, b) => b.adminLevel - a.adminLevel)[0]?.name ?? null;
      const locality = data.locality && data.locality !== data.city ? data.locality : null;
      const city = data.city ?? null;
      return (
        suburb ??
        locality ??
        city ??
        admins.sort((a, b) => b.order - a.order)[0]?.name ??
        null
      );
    }
    const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (place) {
      const parts = [place.subregion, place.city, place.district, place.region].filter(Boolean);
      return parts[0] ?? null;
    }
    return null;
  } catch {
    return null;
  }
};

export const nearestArea = (coords: [number, number]): string => {
  const names = Object.keys(AREA_COORDS).filter((k) => k !== 'Home' && k !== 'Work');
  let best = names[0];
  let bestD = Infinity;
  for (const n of names) {
    const d = distKm(coords, AREA_COORDS[n]);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best;
};