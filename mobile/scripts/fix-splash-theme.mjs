import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_ROOT = path.resolve(__dirname, '..');
const RES = path.resolve(MOBILE_ROOT, 'android/app/src/main/res');
const SPLASH_IMAGE = path.join(MOBILE_ROOT, 'assets/Splash (2).png');

const SPLASH_COLOR = '@color/splashscreen_background';

function decodePng(pngPath) {
  const b = fs.readFileSync(pngPath);
  const w = b.readUInt32BE(16);
  const h = b.readUInt32BE(20);
  const ct = b[25];
  const chunks = [];
  let off = 8;
  while (off < b.length) {
    const len = b.readUInt32BE(off);
    const type = b.toString('ascii', off + 4, off + 8);
    chunks.push([type, len, off + 8]);
    if (type === 'IEND') break;
    off += 12 + len;
  }
  const all = Buffer.concat(chunks.filter((c) => c[0] === 'IDAT').map((c) => b.slice(c[2], c[2] + c[1])));
  const d = zlib.inflateSync(all);
  const ch = ct === 6 ? 4 : 3;
  return { w, h, ch, d, stride: w * ch };
}

function topBandColor(pngPath) {
  const { w, h, ch, d, stride } = decodePng(pngPath);
  const band = Math.max(6, Math.round(h * 0.02));
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = 0; y < band; y++) {
    const row = d.slice(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = Math.round(w * 0.1); x < Math.round(w * 0.9); x++) {
      const i = x * ch;
      r += row[i];
      g += row[i + 1];
      b += row[i + 2];
      n++;
    }
  }
  r = Math.round(r / n);
  g = Math.round(g / n);
  b = Math.round(b / n);
  const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  return { hex, rgb: [r, g, b] };
}

function setSplashColor(colorsXml, hex) {
  const before = colorsXml;
  colorsXml = colorsXml.replace(
    /(<color name="splashscreen_background">)#[0-9A-Fa-f]{6}(<\/color>)/,
    `$1${hex}$2`
  );
  if (colorsXml === before) {
    colorsXml = colorsXml.replace(
      /(<resources[\s\S]*?)(<\/resources>)/,
      `$1  <color name="splashscreen_background">${hex}</color>\n$2`
    );
  }
  return colorsXml;
}

const SPLASH_EXTRA = [
  ['android:windowBackground', SPLASH_COLOR],
  ['android:statusBarColor', SPLASH_COLOR],
  ['android:navigationBarColor', SPLASH_COLOR],
  ['android:windowLightStatusBar', 'false'],
  ['android:windowLightNavigationBar', 'false'],
  ['android:windowSplashScreenIconBackgroundColor', '@android:color/transparent'],
  ['android:windowSplashScreenAnimationDuration', '0'],
];

const APP_EXTRA = [['android:windowBackground', SPLASH_COLOR]];

function injectItems(body, extra) {
  let result = body;
  for (const [name, value] of extra) {
    if (!result.includes(`name="${name}"`)) {
      result += `\n    <item name="${name}">${value}</item>`;
    }
  }
  return result;
}

function patchStyles(xml) {
  xml = xml.replace(
    /(\n\s*<style name="Theme\.App\.SplashScreen"[^>]*>)([\s\S]*?)(\n\s*<\/style>)/,
    (m, open, body, close) => `${open}${injectItems(body, SPLASH_EXTRA)}${close}`
  );
  xml = xml.replace(
    /(\n\s*<style name="AppTheme"[^>]*>)([\s\S]*?)(\n\s*<\/style>)/,
    (m, open, body, close) => `${open}${injectItems(body, APP_EXTRA)}${close}`
  );
  return xml;
}

const candidates = [
  path.join(RES, 'values/styles.xml'),
  path.join(RES, 'values-v31/styles.xml'),
];

if (fs.existsSync(SPLASH_IMAGE)) {
  const { hex, rgb } = topBandColor(SPLASH_IMAGE);
  console.log(`splash top-band color: rgb(${rgb.join(',')}) hex ${hex}`);
  const colorsFile = path.join(RES, 'values/colors.xml');
  if (fs.existsSync(colorsFile)) {
    const xml = fs.readFileSync(colorsFile, 'utf8');
    const updated = setSplashColor(xml, hex);
    if (updated !== xml) {
      fs.writeFileSync(colorsFile, updated);
      console.log('patched', colorsFile, '-> splashscreen_background', hex);
    }
  }
}

for (const file of candidates) {
  if (fs.existsSync(file)) {
    const before = fs.readFileSync(file, 'utf8');
    const after = patchStyles(before);
    if (after !== before) {
      fs.writeFileSync(file, after);
      console.log('patched', file);
    } else {
      console.log('unchanged', file);
    }
  }
}