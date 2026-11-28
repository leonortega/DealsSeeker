# Android device evidence — perfect-score pass

Device: `emulator-5554` only (`adb devices` → `sdk_gphone64_x86_64`, Android 15, 1080x1920,
480 dpi, 60 Hz). No physical device attached. Metro (8081) and API (5005) were already running and
were **not** restarted. `adb reverse tcp:5005 tcp:5005` was re-established because it was missing
(`adb reverse --list` initially showed only 8081).

All commands use:
`C:\Users\marce\AppData\Local\Android\Sdk\platform-tools\adb.exe`

## Artifacts

| File | What it proves |
|---|---|
| `00-device-info.txt` | device, OS, size/density, night/font initial values, reverse mappings, launch activity |
| `01-startup-am-start-W.txt` | three cold `am start -W` timings (dev launcher, see performance profile) |
| `02-phone-dark-offers-font100.png` + `-uiautomator.xml` | dark immersive/standard chrome at 100% text |
| `03-phone-light-offers-font100.png` + `-uiautomator.xml` | light chrome at 100% text |
| `04-phone-dark-immersive-font100.png` + `-uiautomator.xml` | immersive route, dark, Material symbol glyphs |
| `06-phone-light-account-font100.png` + `-uiautomator.xml` | light standard top app bar/footer; avg luminance 170.3/255 |
| `07-phone-dark-account-font100.png` + `-uiautomator.xml` | same screen with `uimode night yes`; avg luminance 170.2/255 — see limitation below |
| `08-phone-font200-standard.png` + `-uiautomator.xml` | 200% font scale; header label bounds 48→81 px tall, 320→544 px wide |
| `09-uiautomator-traversal-analysis.txt` | clickable-node names, sizes and bounds at 100% and 200% |
| `10-phone-landscape-font200.png` + `-uiautomator.xml` | real landscape (`hierarchy rotation="1"`), 1920x1080 |
| `11-landscape-traversal-analysis.txt` | landscape touch-target/bounds analysis at 200% |
| `12-tablet-width-font200.png` + `-uiautomator.xml` | 720 dp width override: left rail (tabs at y 192/348/504) instead of bottom bar |
| `13-tablet-traversal-analysis.txt` | tablet-width target/bounds analysis |
| `14-gfxinfo-framestats.txt`, `15-meminfo.txt` | frame/pipeline stats, PSS memory |
| `16-contrast-audit.json` | 102 measured WCAG pairs (17 roles x 3 worlds x 2 appearances), 0 failures |
| `capture.ps1`, `relaunch.ps1`, `analyze-uiautomator.ps1` | repeatable capture/analysis helpers |

Screenshots were captured with `adb -s emulator-5554 exec-out screencap -p` through a .NET
`Process` writing raw bytes (PowerShell `>` redirection corrupts PNGs to UTF-16).

## Exact commands and results

### Device / configuration

```
adb devices
List of devices attached
emulator-5554    device

adb -s emulator-5554 shell getprop ro.product.model      -> sdk_gphone64_x86_64
adb -s emulator-5554 shell getprop ro.build.version.release -> 15
adb -s emulator-5554 shell wm size                        -> Physical size: 1080x1920
adb -s emulator-5554 shell wm density                     -> Physical density: 480
adb -s emulator-5554 shell cmd uimode night               -> Night mode: no
adb -s emulator-5554 shell settings get system font_scale -> 1.0
adb -s emulator-5554 shell cmd package resolve-activity --brief com.anonymous.dealsseekerreactnative
  -> com.anonymous.dealsseekerreactnative/.MainActivity
adb -s emulator-5554 reverse --list  -> only tcp:8081 (5005 missing)
adb -s emulator-5554 reverse tcp:5005 tcp:5005 -> 5005
```

### Touch targets / traversal (proxy for TalkBack labels)

```
adb -s emulator-5554 shell uiautomator dump /sdcard/window.xml
adb -s emulator-5554 shell cat /sdcard/window.xml
powershell -File analyze-uiautomator.ps1 -Xml <dump>
```

At 100% and 200% font scale (portrait), and at 200% in landscape and tablet-width override, every
`clickable="true"` node exposed a name and met the 48 dp floor (144 px at 480 dpi):

```
Create [168x168] @ (864,1452)
[glyph], My Account [360x146] @ (0,1630)
[glyph], Suggestions [360x146] @ (360,1630)
[glyph], Offers [360x146] @ (720,1630)
issues: 0
```

Immersive controls were also labelled and ≥48 dp: `Directions`, `Favorite`, `Comments`,
`Available?`, `Go to image 1/2`, `More`, `Feed`, `Map`, `Search`, `Help`, `Favorites`, `View all`,
`Select`, `Create` (bounds 156x144 px for the rail actions). Material symbol glyphs are visible as
private-use characters, and the native tab bar's `content-desc` includes the glyph before the name
(e.g. `, My Account`); this is a native react-navigation composition, not a second icon vocabulary.
**TalkBack was not enabled** on the emulator; uiautomator is a structural proxy, not a spoken-output
sign-off (APP.ACCESSIBILITY.UX.003-R8).

### Adaptivity

```
adb -s emulator-5554 shell settings put system font_scale 2.0
adb -s emulator-5554 shell input keyevent 4          # exit immersive to standard shell
adb -s emulator-5554 shell settings put system accelerometer_rotation 0
adb -s emulator-5554 shell settings put system user_rotation 1
  -> hierarchy rotation="1", display 1920x1080, issues: 0
adb -s emulator-5554 shell settings put system user_rotation 0
adb -s emulator-5554 shell wm size 2160x1920         # 720 dp at 480 dpi
  -> tabs moved to a left rail at y=192/348/504, issues: 0
```

### Restoration (all settings returned to their original values)

```
adb -s emulator-5554 shell wm size reset             -> Physical size: 1080x1920
adb -s emulator-5554 shell settings put system user_rotation 0
adb -s emulator-5554 shell settings put system accelerometer_rotation 1
adb -s emulator-5554 shell settings put system font_scale 1.0
adb -s emulator-5554 shell cmd uimode night no       -> Night mode: no
```

## Limitations / not collected

- **Both appearances on the same screen:** the app had a persisted encrypted theme override
  (`SecureStore.xml` key `dealseeker.theme.usr-...`), so `cmd uimode night yes` followed by a full
  relaunch still rendered the light surface (avg luminance 170.2/255 on `07-...`). The dark
  immersive screenshots do show the dark backdrop, but a clean system-dark pass for a standard
  screen was not obtained. Changing/clearing the user's stored preference was avoided.
- **TalkBack spoken traversal** and focus-containment sign-off: TalkBack was not enabled; only
  uiautomator structural evidence was collected.
- **Foldable postures:** no foldable device/emulator posture API is available; the width override
  (720 dp) exercised the unfolded layout only, with no hinge-crossing evidence.
- **Physical-device gestures/refresh rate:** no hardware device attached; emulator gfxinfo results
  are breadth-only.
- **Production startup:** only the dev-client launcher was measured.
- **Tablet hardware:** width override on a phone emulator, not a real tablet.
