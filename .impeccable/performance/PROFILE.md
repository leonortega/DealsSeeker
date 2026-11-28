# Measured performance profile — Android phase (APP.PERFORMANCE.PROFILE.001)

All numbers below were produced on **emulator-5554** (`sdk_gphone64_x86_64`, Android 15,
1080x1920 @ 480 dpi, default refresh rate 60 Hz). The emulator is an x86_64 software-rendered
device, so gesture, refresh-rate and smoothness figures are **breadth-only** and cannot be used
as a physical-device smoothness claim (APP.PERFORMANCE.001-R13, APP.PERFORMANCE.PROFILE.001-R8).
No physical device was attached (`adb devices` listed only `emulator-5554`).

## Budgets (APP.PERFORMANCE.PROFILE.001-R1)

| Metric | Budget | Condition |
|---|---|---|
| Time to first interactive frame | ≤ 1000 ms | process start → first interactive frame, representative device |
| Sustained scroll frame time | p95 ≤ 16.7 ms at 60 Hz (no visible jank) | representative feed, repeated scroll |
| Shipped JS bundle (Hermes) | ≤ 5.0 MB | production export, android platform |
| Offer image cache capacity | 50 entries, LRU eviction, hashed keys | rapid viewing of many images |

## Measurements

### 1. Startup (APP.PERFORMANCE.001-R9, PROFILE-R2)

Command (three cold runs, app force-stopped between each):

```
C:\Users\marce\AppData\Local\Android\Sdk\platform-tools\adb.exe -s emulator-5554 shell am force-stop com.anonymous.dealsseekerreactnative
C:\Users\marce\AppData\Local\Android\Sdk\platform-tools\adb.exe -s emulator-5554 shell am start -W -n com.anonymous.dealsseekerreactnative/.MainActivity
```

Result (full output: `../device-perfect/01-startup-am-start-W.txt`):

| Run | LaunchState | TotalTime | WaitTime | Activity reported |
|---|---|---:|---:|---|
| 1 | COLD | 5192 ms | 5198 ms | DevLauncherActivity |
| 2 | COLD | 2819 ms | 2820 ms | DevLauncherActivity |
| 3 | COLD | 2863 ms | 2866 ms | DevLauncherActivity |

**Interpretation / regression:** `am start -W` measured the **expo-dev-client launcher**
(`DevLauncherActivity`), not the app's first React Native frame; the launcher requires a manual tap
on the cached dev server afterwards. These values therefore **do not** satisfy the 1000 ms budget
for the app itself and are recorded as a regression against that budget until a release-signed
build is measured. Production time-to-first-frame was **not collected**.

### 2. Scroll smoothness (APP.PERFORMANCE.001-R10, PROFILE-R3)

Commands:

```
adb -s emulator-5554 shell dumpsys gfxinfo com.anonymous.dealsseekerreactnative reset
# 12 x: adb -s emulator-5554 shell input swipe 540 1500 540 500 180
adb -s emulator-5554 shell dumpsys gfxinfo com.anonymous.dealsseekerreactnative framestats
```

Result (full output: `../device-perfect/14-gfxinfo-framestats.txt`):

| Window | Frames | Janky | p50 | p90 | p95 | Missed Vsync |
|---|---:|---:|---:|---:|---:|---:|
| Cold start + scroll window | 529 | 65 (12.29%) | 24 ms | 42 ms | 61 ms | 27 |
| Steady-state scroll window | 51 | 0 (0.00%) | 26 ms | 32 ms | 34 ms | 0 |

**Interpretation / regression:** steady-state scrolling had no missed vsync and no janky frames,
but p50/p95 frame times (26/34 ms) exceed the 16.7 ms 60 Hz budget. Software rendering (Goldfish,
Skia/OpenGL) makes this an emulator-only result; a physical-device pass is required before a
smoothness score claim (PROFILE-R7). Process PSS after the scroll was **493,261 kB** Native/Dalvik
heap plus graphics caches (`../device-perfect/15-meminfo.txt`).

### 3. Bundle size (APP.PERFORMANCE.001-R11, PROFILE-R4)

Command (from `src/DealsSeeker.ReactNative`):

```
npx expo export --platform android --output-dir .impeccable/performance/export --non-interactive
```

Result:

| Artifact | Bytes | MiB |
|---|---:|---:|
| `index-a40ba02c4c087142cf8ee40aae4564b7.hbc` (Hermes JS) | 4,615,974 | 4.40 |
| All exported files (JS + 39 assets) | 8,728,289 | 8.32 |

The Hermes bundle is **within the 5.0 MB budget**. No earlier baseline exists, so this export is the
comparable baseline for later builds (PROFILE-R4). Export metadata and assets are retained under
`export/`.

### 4. Bounded image cache (APP.PERFORMANCE.001-R7/R12, PROFILE-R5)

Source of truth: `src/hooks/useOfferImageUri.ts` declares `IMAGE_CACHE_CAPACITY = 50`, hashes the
source reference into a bounded key, writes via deferred promises (`pendingWrites`) and evicts the
oldest entry from `cacheOrder` once capacity is exceeded. Photon location reads use a second bounded
`Map` with FIFO eviction (`LOCATION_CACHE_LIMIT`) in `src/api/client.ts`.

Evidence command and result:

```
npm test -- --runInBand useOfferImageUri.test.tsx images.test.ts
Test Suites: 2 passed, 2 total
Tests:       21 passed, 21 total
```

The suite covers bounded keys and eviction; eviction was verified in code/tests rather than by a
device-side rapid-viewing sequence. A device-side 100-image rapid-viewing sequence was **not
collected**.

## Conditions recorded (PROFILE-R6)

Device class: emulator (x86_64, no physical device); appearance: system light with a persisted app
override (see device-perfect report); font scale: 1.0 for startup/scroll/bundle, 2.0 for the
separate font-scale captures; refresh rate: 60 Hz default; dataset: live API session with a small
offer corpus (few rows), so the scroll pass is not a worst-case 1000-row dataset.

## Regressions blocking a full performance score (PROFILE-R7)

1. Production startup to first interactive frame not measured (dev launcher only).
2. Emulator scroll p95 34 ms > 16.7 ms budget; hardware evidence absent.
3. Device-side image-cache rapid-viewing sequence absent; capacity/eviction evidenced in unit tests.
