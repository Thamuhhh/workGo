import { hasMapKey, maptilerRasterTile } from '../services/maptiler';

export interface LeafletJob {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
}

const tileUrl = hasMapKey
  ? maptilerRasterTile('positron')
  : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const tileAttribution = hasMapKey
  ? '© MapTiler © OpenStreetMap contributors'
  : '© OpenStreetMap contributors';

const SHELL = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #F1F5F9; }
  .wgo-pin { background: transparent; }
  .wgo-pin .pin { width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 50%;
    background: #0F172A; border: 3px solid #fff; box-shadow: 0 2px 6px rgba(15,23,42,0.35);
    display: flex; align-items: center; justify-content: center; }
  .wgo-pin .pin .dot { width: 7px; height: 7px; border-radius: 50%; background: #fff; }
  .wgo-jpin { background: transparent; }
  .wgo-jpin .jpin { display: flex; flex-direction: column; align-items: center; margin: -24px 0 0 -40px; }
  .wgo-jpin .jdot { width: 14px; height: 14px; border-radius: 7px; background: #0F172A;
    border: 2.5px solid #fff; box-shadow: 0 2px 6px rgba(15,23,42,0.25); }
  .wgo-jpin .jtitle { margin-top: 2px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.94);
    font: 600 11px/1.2 system-ui, -apple-system, sans-serif; color: #0F172A; max-width: 120px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .leaflet-control-attribution { font-size: 9px !important; }
</style>
</head>
<body>
<div id="map"></div>
<script>
(function () {
  function post(m) { if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(JSON.stringify(m)); } }
  var map = L.map('map', { attributionControl: true, zoomControl: false, worldCopyJump: true });
  L.tileLayer({TILE_URL}, { attribution: {TILE_ATTR} }).addTo(map);

  var pulse = '';

  {MAP_INIT}

  var ro = typeof ResizeObserver !== 'undefined' && new ResizeObserver(function () { map.invalidateSize(); });
  if (ro) ro.observe(document.getElementById('map'));
  setTimeout(function () { map.invalidateSize(); }, 60);
  setTimeout(function () { map.invalidateSize(); }, 300);

  window.WGO = {
    flyTo: function (lat, lng, zoom) { map.flyTo([lat, lng], zoom || 16, { duration: 0.6 }); },
    zoomIn: function () { map.zoomIn(); },
    zoomOut: function () { map.zoomOut(); }
  };
})();
</script>
</body>
</html>`;

const SAFE = (s: string): string =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export function jobsMapHtml(jobs: LeafletJob[], center: [number, number], zoom = 12): string {
  const markerScript = jobs
    .map((job) => {
      const escapedTitle = SAFE(job.title);
      const escapedId = SAFE(job.id);
      return `(function () {
  var icon = L.divIcon({ className: 'wgo-jpin', html:
    '<div class="jpin"><div class="jdot"></div><span class="jtitle">${escapedTitle}</span></div>' });
  var mark = L.marker([${job.latitude}, ${job.longitude}], { icon: icon, keyboard: false }).addTo(map);
  mark.on('click', function () { post({ type: 'job', id: '${escapedId}' }); });
})();`;
    })
    .join('\n');

  const mapInit = `map.setView([${center[1]}, ${center[0]}], ${zoom});
${markerScript}`;

  return SHELL.replace('{TILE_URL}', tileUrl).replace('{TILE_ATTR}', tileAttribution).replace('{MAP_INIT}', mapInit);
}

export function pickerMapHtml(initial: [number, number], zoom = 14.5): string {
  let mapInit = `
  map.setView([${initial[1]}, ${initial[0]}], ${zoom});
  var icon = L.divIcon({ className: 'wgo-pin', html: '<div class="pin"><div class="dot"></div></div>' });
  var mark = L.marker([${initial[1]}, ${initial[0]}], { icon: icon, keyboard: false, interactive: false }).addTo(map);
  var lastEmit = 0;
  function emit(c) { var now = Date.now(); if (now - lastEmit < 150) return; lastEmit = now;
    post({ type: 'pick', lng: c.lng, lat: c.lat }); }
  map.on('move', function () { mark.setLatLng(map.getCenter()); emit(map.getCenter()); });
  map.on('moveend', function () { mark.setLatLng(map.getCenter()); post({ type: 'pick', lng: map.getCenter().lng, lat: map.getCenter().lat }); });
  post({ type: 'pick', lng: ${initial[0]}, lat: ${initial[1]} });`;

  return SHELL.replace('{TILE_URL}', tileUrl).replace('{TILE_ATTR}', tileAttribution).replace('{MAP_INIT}', mapInit);
}