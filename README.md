# Daydrift Theme Engine

A theme for the Agent Zero WebUI that shifts colors based on the local browser time. The palette moves through 13 phases across the day, and the colors evolve per user as the days pass.

## How it works

### A 13-phase day

The engine defines 13 named phases anchored to clock minutes: midnight, deep_night, predawn, dawn, sunrise, morning, late_morning, solar_noon, afternoon, golden_hour, dusk, evening, and late_evening. For any minute of the day, the engine finds the two surrounding phases and smoothly blends between their color palettes. There are no visible boundaries between phases, just a continuous transition from night to day and back.

### A theme that remembers you

Daily variance is not random. The engine keeps a small record of how the theme has drifted over time, stored in your browser. Each day it nudges that record forward and uses it to shape today's colors. The further the theme wanders from its starting point, the more the math pulls it back, like a rubber band. It explores freely near the center but never gets lost.

Every user gets a unique starting point generated on first load, so two people in the same timezone on the same day will see different themes from day one.

### Readable by design

The engine automatically adjusts text and accent colors to stay readable against both dark sidebars and light daytime chat backgrounds. You don't have to pick accessible colors manually; the engine handles the math so that everything stays legible through every phase of the day.

## Install

Copy the folder into the Agent Zero plugins directory:

```bash
cp -R dynamic_circadian_theme /a0/usr/plugins/dynamic_circadian_theme
```

Reload the WebUI and the theme takes over.

## Preview a full day

Open the browser console and run:

```js
window.DynamicCircadianTheme.preview.start()      // 60-second cycle
window.DynamicCircadianTheme.preview.start(30000) // 30-second cycle
window.DynamicCircadianTheme.preview.stop()
```

A small badge appears in the lower-right corner while previewing.

## Development

```bash
node --test tests/*.test.mjs
```

The plugin exposes `window.DynamicCircadianTheme` as a read-only diagnostic. Set `window.__dynamicCircadianThemeDebug = true` before initialization for full output.

## Removal

Delete the folder. No core files are edited. If dark mode persists afterward, open Preferences and reset it.

## Notes

- Uses local clock time. No geolocation, no external APIs.
- Drift state is stored in your browser under `dynamicCircadianTheme.driftState` and `dynamicCircadianTheme.userId`.

## Community Plugin Index

1. Push this repo to GitHub.
2. Update `index.yaml` with the real GitHub URL.
3. Fork `https://github.com/agent0ai/a0-plugins`.
4. Add `plugins/dynamic_circadian_theme/index.yaml` to the fork.
5. Open a PR.
