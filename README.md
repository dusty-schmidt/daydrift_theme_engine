# Daydrift Theme Engine

Daydrift Theme Engine is an Agent Zero WebUI theme that changes with your local browser time. It moves through twelve hand-tuned phases across the day, from deep night tones through dawn, daytime neutrals, golden hour, dusk, and late evening.

The palette is not a static dark theme. The engine blends phase colors continuously, adds subtle deterministic daily drift, and recalculates readable color tokens for Agent Zero's different surfaces so sidebars, chat, messages, inputs, links, and status text stay usable as the day changes.

## Highlights

- Follows local browser time without external services or geolocation.
- Uses twelve source palettes in `webui/daydrift-phases.mjs`.
- Interpolates smoothly between phases instead of jumping at fixed times.
- Adds small per-user, per-day color variation while staying stable within a day.
- Computes contrast-aware derived colors for dark frame areas and lighter chat surfaces.
- Injects WebUI CSS variables without modifying Agent Zero core files.

## Installation

Copy this repository into your Agent Zero user plugins directory:

```bash
cp -R daydrift_theme_engine /a0/usr/plugins/daydrift_theme_engine
```

Then refresh Agent Zero and enable the plugin from the Plugins UI if needed.

## Development

Run the tests with Node's built-in test runner:

```bash
node --test tests/*.test.mjs
```

The runtime exposes a small diagnostic snapshot at `window.DaydriftTheme` with the current phase, computed palette, and last update time. For extra console diagnostics, set `window.__daydriftThemeDebug = true` before initialization.

## Notes

Daydrift approximates light phases by local clock time. It does not request location data and does not call sunrise/sunset APIs.

Disable or remove the plugin to stop applying the theme. If the browser remains in dark mode after removal, reset Dark mode in Agent Zero Preferences or clear the `darkMode` and `daydriftTheme.previousDarkMode` entries for the WebUI origin.
