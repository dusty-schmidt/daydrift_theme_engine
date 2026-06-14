# Daydrift Theme Engine — TODO

Tracking code review items from the audit.

## ✅ Completed

- [x] **Differentiate night phases** — `midnight`, `deep_night`, `predawn` had identical palettes. Applied subtle 1-2 hex step shifts. (commit `a48e325`)
- [x] **Replace palette() positional calls with object literals** — Data file is now plain objects with named keys. (commit `a48e325`)
- [x] **Expand test coverage** — Suite went from 16 to 29 tests. (commit `a48e325`)
- [x] **Consolidate to single directory** — Git repo lives at `/a0/usr/plugins/daydrift_theme_engine/`. (commit `37e7a14`)
- [x] **Clean dead CSS** — Removed 69 lines of superseded phase-specific overrides (746 → 677). (commit `e1d7e2b`)
- [x] **Extract `warningText` as a constant** — `WARNING_TEXT` constant, replaced 12 inline occurrences. (commit `cbbf5c3`)
- [x] **Add direct `daydrift-phases.mjs` import test** — Validates module boundary independently. (commit `a48e325`)
- [x] **Resolve `messageText` dual-list confusion** — Removed from `DERIVED_KEYS`, added clarifying comment. (commit `3aa2521`)
- [x] **Make cleanup marker XHR async** — Replaced synchronous `XMLHttpRequest` with async `fetch()`. (commit `3aa2521`)
- [x] **Remove legacy drift fields** — Removed `accentHue`/`accentSaturation`/`accentLightness` from `buildDailyDrift` and cleaned `drift.hue`/`drift.saturation`/`drift.lightness` fallbacks from `driftProfileForKey`. Updated tests to assert against new multi-channel fields. (commit `3aa2521`)

## ❌ Remaining

### Important

- [ ] **Rename stale `circadian-*` identifiers** — ~50+ references remain in CSS classes (`dynamic-circadian-theme`, `dynamic-circadian-hide-dark-toggle`), JS constants (`CSS_ID = 'dynamic-circadian-theme-css'`), dataset attributes (`data-circadian-phase`, `data-circadian-preview`), and runtime variable names. **Breaking change** — anyone with custom CSS targeting these selectors would need to update. Consider a major version bump.

### Low Priority

- [ ] **Add test for `composerTextForMinute` branches** — Four branches (before fade-in, during fade-in, dark period, fade-out) untested. Module-private, needs indirect testing approach.
- [ ] **Test the plugin loader** — `load-daydrift-theme.js` has zero tests. Requires browser ES module context.