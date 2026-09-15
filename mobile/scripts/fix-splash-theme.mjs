import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RES = path.resolve(__dirname, '../android/app/src/main/res');

const SPLASH_COLOR = '@color/splashscreen_background';

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