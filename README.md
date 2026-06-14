# Daydrift Theme Engine

A zero-configuration Agent Zero WebUI theme that follows your local browser time, drifting through a rich circadian palette across the day with unique, per-user daily variation.

**v1.0.0**

## What it does

- **Circadian Palette:** Transitions continuously through 12 hand-tuned phases: midnight, deep night, predawn, dawn, sunrise, morning, late morning, solar noon, afternoon, golden hour, dusk, and late evening.
- **Daily Drift:** Adds subtle, deterministic color variation so no two local days are exactly alike, while keeping the palette stable within a single day.
- **Full Color Wheel Accents:** Accent colors are not locked to a single hue. Each day picks a random base hue from the full 360-degree color wheel, with three independent sub-channels (links, fills, highlights) that diverge slightly for visual variety while staying in the same daily color family.
- **Nighttime Accent Glow:** Accent elements become more vibrant at night. Saturation and lightness follow a sine wave peaking at midnight, and CSS glow effects activate during night phases.
- **Dual-Surface Design:** Sidebar panels are neutral greys during daytime and deep blue-blacks at night. Chat backgrounds get pale tints during the day. The engine computes separate text and accent tokens for each surface so everything stays readable.
- **WCAG Contrast Guarantee:** The engine automatically enforces contrast ratios. Accents, borders, and secondary colors are dynamically adjusted to guarantee readability on both dark panels and light daytime chat backgrounds.
- **Zero Configuration:** No settings panel, no manual timezone selection, no sliders. The plugin detects your browser timezone automatically and runs entirely hands-off.
- **Non-Destructive:** Uses Agent Zero CSS variables instead of editing core WebUI files. Hides the default Dark mode toggle in Preferences while active.

---

## Architecture

The plugin is split into four layers, each with a single responsibility:

| Layer | File | Role |
|-------|------|------|
| **Phases** | `webui/daydrift-phases.mjs` | 12 source palettes — pure data, no logic |
| **Engine** | `webui/daydrift-engine.mjs` | Phase interpolation, daily drift, WCAG contrast enforcement |
| **Runtime** | `webui/daydrift-theme.js` | DOM injection, CSS variable updates, dark mode management |
| **Styles** | `webui/daydrift-theme.css` | Scoped CSS that maps computed tokens to Agent Zero UI zones |

The entry point `extensions/webui/initFw_end/load-daydrift-theme.js` loads the runtime when the WebUI initializes.

---

## Color Customization

Want to tweak the colors? The engine handles accessibility automatically, so you only need to set base values.

### The 17-Color Palette

Each phase defines 17 color tokens. Open `webui/daydrift-phases.mjs` and find the `DEFAULT_PHASES` array. Each phase object contains a `palette` with these keys:

```
background       Main page background
text             Global fallback text
textMuted        Muted secondary text
primary          Primary action buttons/fills (panel-optimized)
secondary        Secondary UI decorations (auto-adjusted)
accent           Accent links and focus rings (panel-optimized)
messageBg        Message bubble background
highlight        Selection and glow effects (panel-optimized)
messageText      Text inside message bubbles
panel            Sidebar, card, and modal background
border           Borders (auto-adjusted for contrast)
input            Input field background
inputFocus       Input focus glow
chatBackground   Main chat window background
tableRow         Data table alternating rows
errorText        Error messages (chat-optimized)
warningText      Warning messages
```

### How to customize

1. Open `webui/daydrift-phases.mjs`.
2. Find the phase you want to modify (e.g., the object with `name: 'morning'`).
3. Change the hex code for the color token you want to adjust.
4. Save and refresh the WebUI.

The engine will automatically recalculate dependent tokens like `--color-border`, `--color-secondary`, and cross-surface variants (`chatAccent`, `chatPrimary`, `errorPanel`) to maintain contrast.

### UI Zone Map

```
+----------------------------------------------------------+
|  +------------+  +------------------------------------+  |
|  |  Sidebar   |  |   Chat / Main Area                 |  |
|  | --color-   |  |   --color-chat-background          |  |
|  | panel      |  |   --color-chat-text                |  |
|  | --color-   |  |   --color-chat-accent (links)      |  |
|  | accent     |  |   --color-message-bg (bubbles)     |  |
|  | (buttons)  |  |   --color-message-text             |  |
|  +------------+  +------------------------------------+  |
|  +----------------------------------------------------+  |
|  | Bottom Input Area                                  |  |
|  | --color-panel (bg)  --color-frame-text (text)      |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
```

---

## Installation

Copy this repository root into your Agent Zero user plugins directory:

```bash
cp -R daydrift_theme_engine /a0/usr/plugins/daydrift_theme_engine
```

Then refresh Agent Zero or toggle the plugin from the Plugins UI.

---

## Development

Run the tests with Node's built-in test runner:

```bash
node --test tests/*.test.mjs
python3 tests/test_hooks.py
```

The codebase uses named constants for all numeric thresholds. WCAG ratios, composer time boundaries, drift bounds, and accent hue scales are all extracted to top-of-file constants.

### Debugging

At runtime, the plugin exposes a read-only diagnostic object at `window.DaydriftTheme`:

```js
console.log(window.DaydriftTheme);
// { phase: "morning", palette: { background: "#...", ... }, updatedAt: "2025-..." }
```

Properties: `phase` (current phase name), `palette` (frozen snapshot of all CSS color tokens), `updatedAt` (ISO timestamp of last theme update).

---

## Removal

Disable or delete the plugin folder. It does not edit Agent Zero core files, does not call external services, and does not store secrets. While active it intentionally owns the UI theme mode and writes `localStorage.darkMode = 'true'`. If dark mode remains enabled after removal, open Preferences and reset Dark mode, or clear the browser entries `darkMode` and `daydriftTheme.previousDarkMode` for the Agent Zero WebUI origin.

---

## Notes

This theme approximates circadian phases by local clock time. It intentionally does not request geolocation permissions or call external sunrise/sunset APIs. `always_enabled: false` is intentional in the manifest so community plugins remain user-toggleable.

---

## Community Plugin Index

This plugin is structured for submission to the [Agent Zero Plugin Index](https://github.com/agent0ai/a0-plugins).

Repository: [github.com/dusty-schmidt/daydrift_theme_engine](https://github.com/dusty-schmidt/daydrift_theme_engine)
