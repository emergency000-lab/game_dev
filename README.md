# Rath Yatra: Divine Journey

A respectful, premium mobile-first endless runner prototype celebrating Jagannath Rath Yatra and Indian heritage. The player guides the sacred Rath itself through a living procession; the deities are presented with reverent idle-only glow, flowers, cloth movement, and lighting.

## Prototype Scope

This repository is a dependency-free HTML5 Canvas/PWA implementation that can be shipped in an Android WebView or Trusted Web Activity while preserving the requested AAA mobile design pillars for a future Unity 6 URP production build.

## Features

- Subway Surfers / Temple Run style third-person chase camera with three responsive lanes.
- Swipe left/right to change lanes, swipe up for Speed Boost, swipe down for Brake / Slide, double tap for Divine Power, and long press for Temple Bell slow motion.
- Animated Rath details: rotating wooden wheels, wind-reactive flags, swaying garlands, ropes, dust particles, golden ornaments, suspension bob, and protective aura power effects.
- Respectful deity presentation: Lord Jagannath, Lord Balabhadra, and Devi Subhadra remain within the Rath with idle-only glow and floral/cloth motion.
- Seven progression routes: Village, Town, Temple Street, Grand Puri Procession, Bada Danda, Gundicha Temple Route, and Festival Finale.
- Dynamic events: sudden rain, heavy crowd, flower rain, temple bells, sunrise, golden evening, night procession, lightning, and windstorm.
- Obstacles and festival hazards including broken roads, buffalo/cow crossing, street vendors, barricades, electric poles, rain puddles, loose stones, festival carts, road construction, moving vehicles, sharp turns, and crowd congestion.
- Power-ups: Jagannath Blessing invincibility, Sudarshan Chakra Shield, Mahaprasad health restore, Golden Rope attraction, Temple Bell slow motion, and Divine Light double score.
- Educational cards after completed levels covering Rath Yatra history, Lord Jagannath, Balabhadra, Subhadra, Niladri Bije, Hera Panchami, Snana Purnima, chariot names, and Indian heritage.
- Android-focused PWA features: offline service worker, local save, responsive portrait layout, haptics, adaptive canvas scale, large touch targets, and no network dependencies.

## Cultural Respect Notes

The game focuses on devotion, community, safety, joy, education, and Indian heritage. The player protects and guides the Rath; the player never controls the deities. The experience avoids violence, horror, gambling, ridicule, stereotypes, exaggerated deity animation, and inappropriate content.

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
4. Enable JavaScript, DOM storage, safe-area handling, haptic feedback, and back-button pause/resume behavior.

## Unity 6 URP Production Path

For a full AAA Unity build, keep this prototype as the game-design reference and rebuild with URP, Addressables, GPU instancing for crowds, pooled VFX, baked occlusion, adaptive resolution, Google Play Games Services, cloud-save-ready data, and Android performance budgets targeting 60 FPS on 3GB+ RAM devices.

## Optimization Checklist

- No external runtime dependencies or network requests.
- Vector icons and procedural canvas art keep package size small.
- Object arrays are pruned each frame; reduced-motion preference disables particles.
- Canvas renders at a fixed internal resolution and scales responsively for Android phones and tablets.
