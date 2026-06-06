# Daydrift Theme Engine

A zero-configuration Agent Zero WebUI theme that follows your local browser time, drifting through a rich circadian palette across the day with unique, per-user daily variation.

## What it does

- **Circadian Palette:** Transitions continuously through 13 phases: midnight, deep night, predawn, dawn, sunrise, morning, late morning, solar noon, afternoon, golden hour, dusk, evening, and late evening.
- **Daily Drift:** Adds subtle, deterministic color variation so no two local days are exactly alike, while keeping the palette stable during a single day.
- **WCAG Contrast Guarantee:** The engine **automatically enforces** contrast ratios. Accents, borders, and secondary colors are dynamically adjusted to guarantee readability on both dark panels and light daytime chat backgrounds. You only need to pick colors that look good aesthetically.
- **Zero-Friction:** Requires no user configuration and exposes no settings panel. Hides the default **Dark mode** toggle in Preferences while active.
- **Non-Destructive:** Uses Agent Zero CSS variables instead of editing core WebUI files.

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
3. **Locate the phase** you want to modify (e.g., `phase('morning', 450, palette(...))`).
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
cp -R dynamic_circadian_theme /a0/usr/plugins/dynamic_circadian_theme
```

Then refresh Agent Zero or toggle the plugin from the Plugins UI.

---

## Preview a Full Day Cycle

After reloading Agent Zero with the plugin active, open the browser developer console and run:

```js
window.DynamicCircadianTheme.preview.start()
```

By default this compresses a full 24-hour circadian color cycle into 60 seconds. You can choose a different duration in milliseconds:

```js
window.DynamicCircadianTheme.preview.start(30000) // 30-second full-day preview
window.DynamicCircadianTheme.preview.start(120000) // 2-minute full-day preview
```

Stop preview mode and return to live local time with:

```js
window.DynamicCircadianTheme.preview.stop()
```

While preview is running, a small **Circadian preview** badge appears in the lower-right corner of the WebUI.

---

## Development & Testing

```bash
# Run unit and runtime tests
node --test tests/*.test.mjs

# Validate plugin structure (if preparing for community index)
python3 scripts/validate_plugin.py
```

### Debugging
At runtime, the plugin exposes a read-only diagnostic object at `window.DynamicCircadianTheme`. By default it contains the current phase, palette, and last update timestamp. For full diagnostics, set `window.__dynamicCircadianThemeDebug = true` before initialization (treat as same-origin debug metadata).

---

## Removal

Disable or delete the plugin folder. It does not edit Agent Zero core files, does not call external services, and does not store secrets. While active it intentionally owns the UI theme mode and writes `localStorage.darkMode = 'true'`. If dark mode remains enabled after removal, open Preferences and reset **Dark mode**, or clear the browser entries `darkMode` and `dynamicCircadianTheme.previousDarkMode` for the Agent Zero WebUI origin.

---

## Notes

This version approximates circadian phases by local clock time. It intentionally does not request geolocation permissions or call external sunrise/sunset APIs. `always_enabled: false` is intentional in the manifest; community plugins should remain user-toggleable so users can disable or remove the theme without framework-level lock-in.

## Community Plugin Index

This repository is structured with plugin contents at the repository root. Before submitting to the Plugin Index:

1. Push this repository to GitHub.
2. Update `index.yaml` so `github:` points to the real repository URL. The checked-in value is intentionally a placeholder until you provide your GitHub owner/repo.
3. Run strict community validation: `python3 scripts/validate_plugin.py --strict-index`.
4. Fork `https://github.com/agent0ai/a0-plugins`.
5. Add `plugins/dynamic_circadian_theme/index.yaml` to the fork.
6. Open a PR.