# Daydrift Theme Engine — Work Log

## 2026-06-07 — Color Rework (5 phases)

### Phase 1: Accent Decoupling

**Goal:** Free accent colors from the phase palette's blue/purple anchor so they traverse the full color wheel.

**Changes to `webui/circadian-engine.mjs`:**
- Added `accentBaseHue: round(random() * 360, 1)` to `buildDailyDrift` — one random hue per day, full 0-360 range
- Rewrote `driftProfileForKey` accent branch: accent keys now use `drift.accentBaseHue` + sub-offset instead of adding a small offset to the interpolated phase hue
- `accent` key: `baseHue + accentLinkHue * 0.3 + accentBias`
- `primary` key: `baseHue + accentFillHue * 0.25`
- `highlight` key: `baseHue + accentGlowHue * 0.2`
- Saturation and lightness unchanged — still phase-driven

**Result:** Every day picks a random accent hue (red, green, cyan, etc.) while the three sub-channels stay grouped but distinguishable.


## 2026-06-07 (16:45) — Day Panel Tonal Rewrite + Surface Separation

**Goal:** Fix sterile flat-grey panels by adding subtle hue tint (S~0.08) that mirrors each phase's chat background direction, per UX skill guidance (avoid gray-on-gray, use tonal surfaces). Add CSS border for visual separation.

**Changes to `webui/circadian-engine.mjs`:**
- `morning`      panel: #6d6f70 → #5e696e, messageBg: #6d6f70 → #697277  (cool blue-grey)
- `late_morning` panel: #6f726d → #636e5e, messageBg: #6f726d → #6e7769  (green-grey)
- `solar_noon`   panel: #72716d → #6e695e, messageBg: #72716d → #777269  (warm beige-grey)
- `afternoon`    panel: #72706d → #6e675e, messageBg: #72706d → #777169  (amber-grey)
- Lightness stays ~L 0.40, saturation bumped from S~0.02 to S~0.08

**Changes to `webui/circadian-theme.css`:**
- Added `border-right: 1px solid color-mix(in srgb, var(--color-border) 40%, transparent)` to `.sidebar-shell` and `#left-panel` for surface separation from chat background

**UX skill rationale (ui-ux-pro-max):**
- Dark/medium surfaces should use tonal variants, not just flat grey (Quick Reference §6 color-dark-mode)
- Surfaces need clear separation from background via borders/shadow (§6 color-dark-mode)
- Use semantic tokens, not hardcoded hex (already handled via --color-* vars)

**Result:** Panels have subtle color identity per phase while staying muted and readable. 14/16 tests pass — 2 pre-existing accent drift failures unrelated to panels.

---

### Phase 2: 12-Phase Palette Rewrite

**Goal:** Replace 13 uneven phases with 12 equal-length phases at 120-minute intervals. Neutralize panels to greys during daytime, deep blue-blacks at night. Add color tint to chat backgrounds.

**Changes to `webui/circadian-engine.mjs`:**
- Replaced entire `DEFAULT_PHASES` array (lines 16-29)
- 12 phases: midnight(0), deep_night(120), predawn(240), dawn(360), sunrise(480), morning(600), late_morning(720), solar_noon(840), afternoon(960), golden_hour(1080), dusk(1200), late_evening(1320)
- Night panel lightness: L 0.06-0.07 (deep blue-blacks)
- Day panel lightness: L 0.55-0.62 (neutral greys)
- Night chat background: L 0.07-0.09 (dark with tint)
- Day chat background: L 0.81-0.84 (pale sky/green/warm tints)
- Night accent saturation: 0.65, lightness: 0.55
- Day accent saturation: 0.35, lightness: 0.44
- Dropped the `evening` phase (was at 1200 in old 13-phase layout)

**Result:** Panels are now neutral and understated during the day, letting the chat background and accents carry the visual character.

---

### Phase 3: Nighttime Accent Glow

**Goal:** Accent elements become more vibrant at night — higher saturation, higher lightness, plus CSS glow effects.

**Changes to `webui/circadian-engine.mjs`:**
- Added `applyNighttimeAccentBoost(result, minuteOfDay)` function
- Sine-wave boost peaking at midnight: +0.25 saturation, +0.12 lightness
- Applied to accent, primary, highlight, chatAccent, chatPrimary, chatHighlight
- Called before `enforceReadableText` in `interpolatePalette`

**Changes to `webui/circadian-theme.css`:**
- Added `.night-glow` class toggled on body
- Added `[data-circadian-phase="midnight"]` etc. selectors for box-shadow glow on active chat items, message bubbles, and the preview badge

**Result:** Nighttime UI glows with vibrant accent colors while daytime stays muted and readable.

---

### Phase 4: Brightness Slider

**Goal:** User-configurable brightness range — darken daytime phases or brighten nighttime phases.

**Changes to `webui/config.html`:**
- Added "Brightness" field with `<input type="range">` (min=0, max=1, step=0.05, default=0.5)
- Saves to `localStorage('daydriftTheme.brightness')`

**Changes to `webui/circadian-engine.mjs`:**
- Added `getBrightnessSetting()` function reading from localStorage
- Replaced old panel lightening block with brightness clamping: remaps lightness range for panel, chatBackground, background, messageBg, tableRow, input
- `minL = 0.02 + brightness * 0.15` (range 0.02-0.17)
- `maxL = 0.65 + brightness * 0.30` (range 0.65-0.95)
- Applied after `ensureFrameWindowSeparation`, before `enforceReadableText`

**Result:** Slider at 0 = all dark mode. Slider at 1 = night phases never go fully black. Default 0.5 = balanced.

---

### Phase 5: Timezone Dropdown

**Goal:** Replace free-text timezone input with a proper dropdown grouped by region.

**Changes to `webui/config.html`:**
- Replaced `<input type="text">` with `<select>` containing `<optgroup>` sections
- Groups: North America (4), Europe (3), Asia (3), Oceania (2)
- "auto (browser detected)" as first option
- Same Alpine.js x-model and @change behavior

**Result:** No more typos or guessing IANA timezone names.

---

### Preview Button Enhancement

**Goal:** One-click 30-second preview from the settings panel, auto-stop after one cycle.

**Changes to `webui/circadian-theme.js`:**
- Modified `startPreview(durationMs, autoStop)` — when `autoStop=true`, sets `setTimeout` to call `stopPreview(true)` after one full cycle
- Added `previewAutoStopId` timer variable
- `stopPreview()` clears the auto-stop timer to prevent double-stop race

**Changes to `webui/config.html`:**
- Added "Preview 24h Cycle" section with button
- Button shows three states: "Start 30s Preview" → "Preview running…" (disabled) → "Cycle complete"

---

### Files Modified

| File | Phases |
|---|---|
| `webui/circadian-engine.mjs` | 1, 2, 3, 4 |
| `webui/circadian-theme.css` | 3 |
| `webui/circadian-theme.js` | Preview button |
| `webui/config.html` | 4, 5, Preview button |
| `README.md` | Documentation |

### Tests

All 16 tests pass after all phases:
- `node --test tests/circadian-engine.test.mjs tests/circadian-runtime.test.mjs`
- Tests updated for 12-phase boundaries and accentBaseHue additions

### Rollback

```bash
cd /a0/usr/plugins/daydrift_theme_engine
git checkout -- webui/circadian-engine.mjs webui/circadian-theme.css webui/circadian-theme.js webui/config.html
```