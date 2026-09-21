import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Icon } from './Icon';
import { hasMapKey, maptilerRasterTile } from '../services/maptiler';

export interface LocationPickerMapProps {
  initial: [number, number]; // [lng, lat]
  onPick: (coords: [number, number]) => void;
}

function loadCss(href: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) return resolve();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    document.head.appendChild(link);
    setTimeout(resolve, 2000);
  });
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

function ensurePinCss() {
  if (document.getElementById('wgo-pin-css')) return;
  const style = document.createElement('style');
  style.id = 'wgo-pin-css';
  style.innerHTML = `
    .wgo-pin { background: transparent; }
    .wgo-pin.show-pulse #wgo-pulse {
      animation: wgo-pulse 1.1s ease-out 1;
    }
    @keyframes wgo-pulse {
      0% { opacity: 0.6; transform: scale(0.6); }
      100% { opacity: 0; transform: scale(1.2); }
    }
  `;
  document.head.appendChild(style);
}

const pinHtml = `
  <div style="position:relative;width:26px;height:26px;">
    <div id="wgo-pulse" style="position:absolute;inset:-10px;border-radius:50%;background:rgba(39,174,96,0.35);opacity:0;"></div>
    <div style="position:absolute;width:26px;height:26px;border-radius:50%;
      background:#0F172A;border:3px solid #fff;
      box-shadow:0 2px 6px rgba(15,23,42,0.35);
      display:flex;align-items:center;justify-content:center;">
      <div style="width:7px;height:7px;border-radius:50%;background:#fff;"></div>
    </div>
  </div>`;

// Web: Leaflet via CDN (free, no key). Maplibre is never loaded on web.
// Swiggy-style: the pin is fixed at map centre; moving the map moves the location.
export function LocationPickerMap({ initial, onPick }: LocationPickerMapProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let map: any = null;
    let cancelled = false;

    const init = async () => {
      const win = window as any;
      ensurePinCss();
      await loadCss('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
      const L = win.L;
      if (!L || cancelled || !hostRef.current) return;

      map = L.map(hostRef.current, {
        attributionControl: true,
        dragging: true,
        zoomControl: false,
      }).setView([initial[1], initial[0]], 14);
      mapRef.current = map;

      L.tileLayer(
        hasMapKey ? maptilerRasterTile('positron') : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: hasMapKey
            ? '© MapTiler © OpenStreetMap contributors'
            : '© OpenStreetMap contributors',
        }
      ).addTo(map);

      const icon = L.divIcon({
        className: 'wgo-pin',
        html: pinHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const mark = L.marker([initial[1], initial[0]], {
        draggable: false,
        icon,
        zIndexOffset: 1000,
        keyboard: false,
      }).addTo(map);
      markerRef.current = mark;

      const emit = (latlng: any) => {
        onPick([latlng.lng as number, latlng.lat as number]);
      };

      const pulse = () => {
        if (!mark._icon) return;
        mark._icon.classList.add('show-pulse');
        setTimeout(() => mark._icon?.classList.remove('show-pulse'), 1200);
      };

      let lastEmit = 0;
      map.on('move', () => {
        const c = map.getCenter();
        mark.setLatLng(c);
        const now = Date.now();
        if (now - lastEmit > 150) {
          lastEmit = now;
          emit(c);
        }
      });
      map.on('moveend', () => {
        const c = map.getCenter();
        mark.setLatLng(c);
        emit(c);
        pulse();
      });

      const fix = () => {
        if (map && !cancelled) map.invalidateSize();
      };
      setTimeout(fix, 50);
      setTimeout(fix, 250);
      window.addEventListener('resize', fix);
      const ro =
        typeof ResizeObserver !== 'undefined' && new ResizeObserver(fix);
      if (ro && hostRef.current) ro.observe(hostRef.current);
    };

    init();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locate = () => {
    if (locating || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        const map = mapRef.current;
        const mark = markerRef.current;
        if (!map || !mark) return;
        map.flyTo([latitude, longitude], 16, { duration: 0.6 });
        mark.setLatLng([latitude, longitude]);
        onPick([longitude, latitude]);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
    );
  };

  const zoom = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    if (delta > 0) map.zoomIn();
    else map.zoomOut();
  };

  return (
    <View style={styles.host}>
      <div ref={hostRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />
      <View style={styles.controls}>
        <Pressable style={styles.ctrlBtn} onPress={() => zoom(1)} hitSlop={8}>
          <Icon name="add" size={22} color="#0F172A" />
        </Pressable>
        <Pressable style={styles.ctrlBtn} onPress={() => zoom(-1)} hitSlop={8}>
          <Icon name="remove" size={22} color="#0F172A" />
        </Pressable>
        <Pressable style={styles.ctrlBtn} onPress={locate} hitSlop={8}>
          <Icon name={locating ? 'navigate' : 'navigate-outline'} size={20} color="#0F172A" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    cursor: 'grab' as any,
  },
  controls: {
    position: 'absolute',
    right: 12,
    top: '38%',
    zIndex: 1000,
  },
  ctrlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    cursor: 'pointer' as any,
    zIndex: 1101,
  },
});