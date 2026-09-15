const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * withAndroidSplashFull
 *
 * Fixes the Android 12+ (API 31+) splash screen so the full PNG artwork is
 * used as the launch background instead of a small centered adaptive icon.
 *
 * Problem:
 *   expo-splash-screen with resizeMode:"cover" generates values-v31/styles.xml
 *   using windowSplashScreenAnimatedIcon, which Android 12+ renders as a small
 *   (~1/3 screen-width) centered icon.
 *
 * Fix:
 *   After expo-splash-screen runs its plugin, this plugin overwrites
 *   values-v31/styles.xml to use:
 *     - windowSplashScreenBackground   -> full-screen bitmap (gravity="fill")
 *     - windowSplashScreenAnimatedIcon -> transparent shape (no icon shown)
 */
function withAndroidSplashFull(config, { image = './assets/Splash (2).png' } = {}) {
  return withDangerousMod(config, [
    'android',
    async (expoConfig) => {
      const projectRoot = expoConfig.modRequest.projectRoot;
      const platformRoot = expoConfig.modRequest.platformProjectRoot;
      const resDir = path.join(platformRoot, 'app', 'src', 'main', 'res');

      // 1. Copy splash PNG to drawable-nodpi
      const nodpiDir = path.join(resDir, 'drawable-nodpi');
      fs.mkdirSync(nodpiDir, { recursive: true });
      const srcImage = path.join(projectRoot, image);
      if (!fs.existsSync(srcImage)) {
        throw new Error('[withAndroidSplashFull] Splash image not found: ' + srcImage);
      }
      fs.copyFileSync(srcImage, path.join(nodpiDir, 'splash_full.png'));

      // 2. Create splash_full_bg.xml (gravity=fill stretches to fill window)
      const drawableDir = path.join(resDir, 'drawable');
      fs.mkdirSync(drawableDir, { recursive: true });
      fs.writeFileSync(
        path.join(drawableDir, 'splash_full_bg.xml'),
        '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<bitmap xmlns:android="http://schemas.android.com/apk/res/android"\n' +
        '    android:gravity="fill"\n' +
        '    android:src="@drawable/splash_full"/>\n'
      );

      // 3. Create transparent icon drawable
      fs.writeFileSync(
        path.join(drawableDir, 'splash_transparent_icon.xml'),
        '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<shape xmlns:android="http://schemas.android.com/apk/res/android"\n' +
        '    android:shape="rectangle">\n' +
        '    <solid android:color="#00000000"/>\n' +
        '</shape>\n'
      );

      // 4. Overwrite values-v31/styles.xml for Android 12+
      const valuesV31Dir = path.join(resDir, 'values-v31');
      fs.mkdirSync(valuesV31Dir, { recursive: true });
      fs.writeFileSync(
        path.join(valuesV31Dir, 'styles.xml'),
        '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<resources>\n' +
        '  <style name="Theme.App.SplashScreen" parent="Theme.SplashScreen">\n' +
        '    <item name="android:windowSplashScreenBackground">@drawable/splash_full_bg</item>\n' +
        '    <item name="android:windowSplashScreenAnimatedIcon">@drawable/splash_transparent_icon</item>\n' +
        '    <item name="android:windowSplashScreenIconBackgroundColor">@android:color/transparent</item>\n' +
        '    <item name="android:windowSplashScreenAnimationDuration">0</item>\n' +
        '    <item name="postSplashScreenTheme">@style/AppTheme</item>\n' +
        '  </style>\n' +
        '</resources>\n'
      );

      console.log('[withAndroidSplashFull] Android 12+ full-screen splash configured.');
      return expoConfig;
    },
  ]);
}

module.exports = withAndroidSplashFull;
