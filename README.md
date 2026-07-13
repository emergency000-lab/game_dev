# Rath Yatra: Journey of Devotion

A respectful, educational, mobile-first festival runner inspired by Rath Yatra. The player guides a sacred chariot procession, helps devotees board safely, collects blessings and traditional festival items, avoids obstacles, and unlocks short learning cards after each chapter.

## Features

- Canvas-based 2D runner tuned for Android WebView/PWA deployment.
- Portrait layout, large touch controls, keyboard fallback, safe-area aware UI, light/dark mode, high contrast toggle, and easy mode.
- Five story chapters: Village Road, Town Celebration, Temple Surroundings, Grand Puri Procession, and Festival Finale.
- Devotee boarding, blessing meter, crowd happiness, Rath health, coins, local save, collectible chains, power-ups, particles, haptics, pause, and chapter-complete educational cards.
- Offline-first service worker and installable web app manifest with adaptive-style SVG icons.

## Cultural Respect Notes

The game focuses on devotion, community, joy, education, and Indian heritage. It avoids combat, ridicule, stereotypes, and inaccurate sensationalism. Facts are intentionally short and non-sectarian for an all-ages audience.

## Run Locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser or Android device on the same network.

## Android Build Options

### PWA / Trusted Web Activity

1. Host these static files over HTTPS.
2. Use Bubblewrap or Android Studio's Trusted Web Activity template.
3. Set the app orientation to portrait and minimum SDK to Android 8.0 (API 26).
4. Generate APK/AAB from Android Studio for Play Console upload.

### WebView Wrapper

1. Create a native Android project with `minSdk 26`.
2. Place this project in `app/src/main/assets/game/`.
3. Load `file:///android_asset/game/index.html` from a hardware-accelerated WebView.
4. Enable JavaScript, DOM storage, safe-area handling, and back-button pause/resume behavior.

## Optimization Checklist

- No external runtime dependencies or network requests.
- Vector icons and procedural canvas art keep package size small.
- Object arrays are pruned each frame; reduced-motion preference disables particles.
- CSS and Canvas scale responsively for phones, tablets, and future Android TV/web support.
