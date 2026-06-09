# Daydrift Theme Engine

A zero-configuration Agent Zero WebUI theme that follows your local browser time, drifting through a rich circadian palette across the day with unique, per-user daily variation.

## What it does

- **Circadian Palette:** Transitions continuously through 12 equal-length phases: midnight, deep night, predawn, dawn, sunrise, morning, late morning, solar noon, afternoon, golden hour, dusk, and late evening.
- **Daily Drift:** Adds subtle, deterministic color variation so no two local days are exactly alike, while keeping the palette stable during a single day.
- **Full Color Wheel Accents:** Accent colors (links, buttons, highlights) are no longer locked to blue/purple tones. Each day picks a random base hue from the full 360-degree color wheel, with three independent sub-channels (links, fills, highlights) that diverge slightly for visual variety while staying in the same daily color family.
- **Nighttime Accent Glow:** Accent elements become more vibrant at night — saturation and lightness boost on a sine wave peaking at midnight. CSS glow effects (box-shadows) activate during night phases.
- **Neutral Panel Design:** Sidebar panels are neutral greys during daytime and deep blue-blacks at night. Chat backgrounds get pale tints (sky blue, pale green, warm) during the day.
- **WCAG Contrast Guarantee:** The engine **automatically enforces** contrast ratios. Accents, borders, and secondary colors are dynamically adjusted to guarantee readability on both dark panels and light daytime chat backgrounds.
- **Settings Panel:** Timezone override dropdown (grouped by region), brightness slider (darken day phases or brighten night phases), and a one-click 30-second full-cycle preview button.
- **Non-Destructive:** Uses Agent Zero CSS variables instead of editing core WebUI files. Hides the default **Dark mode** toggle in Preferences while active.

---

## 🎨 Color Customization Guide

Want to tweak the colors to match your aesthetic? You no longer need to be a color-science expert. The engine handles accessibility automatically.

### The 17-Color Palette
To change colors, open `webui/circadian-engine.mjs` and find the `DEFAULT_PHASES` array. Each phase calls the `palette()` function with exactly **17 arguments** in this order:

```javascript
palette(
  background,    // 1. Main page background
  text,          // 2. Global fallback text
  textMuted,     // 3. Muted text (chat areas)
  primary,       // 4. Primary action buttons/links (panel-optimized)
  secondary,     // 5. Secondary UI decorations (auto-adjusted)
  accent,        // 6. Accent glow/hover (panel-optimized)
  messageBg,     // 7. Message bubble background
  highlight,     // 8. Selection/highlight glow (panel-optimized)
  messageText,   // 9. Text inside message bubbles
  panel,         // 10. Sidebar/card/modal background
  border,        // 11. Borders (auto-adjusted for 2.0+ contrast)
  input,         // 12. Input field background
  inputFocus,    // 13. Input focus glow
  chatBackground,// 14. Main chat window background
  tableRow,      // 15. Data table alternating rows
  errorText,     // 16. Error messages (chat-optimized)
  warningText    // 17. Warning messages
)
```

### Step-by-Step Customization
1. **Identify the zone** you want to change (see UI Map below).
2. **Open** `webui/circadian-engine.mjs` and find the `DEFAULT_PHASES` array.
3. **Locate the phase** you want to modify (e.g., `phase('morning', 600, palette(...))`).
4. **Change the hex code** for the corresponding argument.
5. **Save and refresh** the WebUI. The engine will automatically recalculate dependent tokens (like `--color-border` and `--color-secondary`) to guarantee readability.

> 💡 **Dual-Surface Architecture:** The engine computes variants like `chatAccent`, `chatPrimary`, and `errorPanel` automatically. You only set the base `accent` value; the engine ensures it remains readable on *both* dark sidebars and light chat windows.

### Visual UI Map
```
┌──────────────────────────────────────────────────────────┐
│  ┌────────────┐  ┌────────────────────────────────────┐ │
│  │  Sidebar   │  │   Chat / Main Area                 │ │
│  │ --color-   │  │   --color-chat-background          │ │
│  │ panel      │  │   --color-chat-text                │ │
│  │ --color-   │  │   --color-chat-accent (links)      │ │
│  │ accent     │  │   --color-message-bg (bubbles)     │ │
│  │ (buttons)  │  │   --color-message-text             │ │
│  └────────────┘  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Bottom Input Area                                  │ │
│  │ --color-panel (bg)  --color-frame-text (text)      │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Install Locally

Copy this repository root into your Agent Zero user plugins directory:

```bash
cp -R daydrift_theme_engine /a0/usr/plugins/daydrift_theme_engine
```

Then refresh Agent Zero or toggle the plugin from the Plugins UI.

---

## Settings Panel

Open the plugin settings panel from the Plugins menu. It provides:

- **Timezone override dropdown** — select an IANA timezone (grouped by region) to preview what the theme looks like at that location's local time. Leave as `auto` to use your browser's detected timezone.
- **Brightness slider** — darken daytime phases or brighten nighttime phases. Range 0 (darkest) to 1 (lightest), default 0.5.
- **Preview 24h Cycle button** — one-click 30-second full circadian cycle. Runs once and stops automatically. Close the settings menu to watch the chat transform.

## Preview a Full Day Cycle

Click the **Start 30s Preview** button in the settings panel, or use the console:

```js
window.DaydriftTheme.preview.start(30000, true)   // 30s full-day preview, auto-stop
window.DaydriftTheme.preview.start(60000)          // 60s preview, continuous loop
```

Stop preview mode and return to live local time with:

```js
window.DaydriftTheme.preview.stop()
```

While preview is running, a small **Circadian preview** badge appears in the lower-right corner of the WebUI showing the current phase and completion percentage.

---

## Development & Testing

```bash
# Run unit and runtime tests
node --test tests/*.test.mjs
```

### Debugging
At runtime, the plugin exposes a read-only diagnostic object at `window.DaydriftTheme`. By default it contains the current phase, palette, and last update timestamp. For full diagnostics, set `window.__daydriftThemeDebug = true` before initialization (treat as same-origin debug metadata).

---

## Removal

Disable or delete the plugin folder. It does not edit Agent Zero core files, does not call external services, and does not store secrets. While active it intentionally owns the UI theme mode and writes `localStorage.darkMode = 'true'`. If dark mode remains enabled after removal, open Preferences and reset **Dark mode**, or clear the browser entries `darkMode` and `daydriftTheme.previousDarkMode` for the Agent Zero WebUI origin.

---

## Notes

This version approximates circadian phases by local clock time. It intentionally does not request geolocation permissions or call external sunrise/sunset APIs. `always_enabled: false` is intentional in the manifest; community plugins should remain user-toggleable so users can disable or remove the theme without framework-level lock-in.

## Community Plugin Index

This repository is structured with plugin contents at the repository root. Before submitting to the Plugin Index:

1. Push this repository to GitHub.
2. Update `index.yaml` so `github:` points to the real repository URL. The checked-in value is intentionally a placeholder until you provide your GitHub owner/repo.
3. As a minimum check, run the tests: `node --test tests/*.test.mjs`.
4. Fork `https://github.com/agent0ai/a0-plugins`.
5. Add `plugins/daydrift_theme_engine/index.yaml` to the fork.
6. Open a PR.