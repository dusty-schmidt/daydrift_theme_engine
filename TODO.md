# Daydrift Theme Engine — TODO

Tracking code review items from the audit.

## ✅ Completed

- [x] **Differentiate night phases** — `midnight`, `deep_night`, `predawn` had identical palettes. Applied subtle 1-2 hex step shifts so interpolation produces visible progression. (commit `a48e325`)
- [x] **Replace palette() positional calls with object literals** — Removed the 17-positional-arg `palette()` and `phase()` helpers from `daydrift-phases.mjs`. Data file is now plain objects with named keys. (commit `a48e325`)
- [x] **Add direct daydrift-phases.mjs import test** — Validates the module boundary independently. If the engine re-export breaks, this test catches it. (commit `a48e325`)
- [x] **Expand test coverage** — Suite went from 16 to 29 tests (26 Node + 3 Python hooks). Covers derived tokens, night phase differentiation, dayDimmer, buildDailyDrift multi-channel fields, edge cases, and hooks.py lifecycle. (commit `a48e325`)
- [x] **Consolidate to single directory** — Eliminated the workdir/plugins dual-directory setup. Git repo now lives at `/a0/usr/plugins/daydrift_theme_engine/`. (commit `37e7a14`)

## ❌ Remaining

### Critical

- [ ] **Clean ~70 lines of dead CSS** — Phase-specific input color overrides at lines 171-199 and 236-243 in `daydrift-theme.css` are fully superseded by the `:is()` consolidation at 262-269. Three blocks doing the same thing. Remove the first two blocks.

### Important

- [ ] **Extract `warningText` as a constant** — `#d7a85f` appears in all 12 phases identically. It's effectively a constant duplicated 12 times. Could be defined once in the engine or data file and applied programmatically.

- [ ] **Resolve `messageText` dual-list confusion** — `messageText` appears in both `PALETTE_KEYS` (source palette) and `DERIVED_KEYS` (computed tokens). It's a source key that gets overwritten by `enforceReadableText`. Having it in both lists is confusing. Move it to the right list or document the override.

- [ ] **Make cleanup marker XHR async** — `xhr.open('GET', '/usr/plugins/.daydrift_cleanup', false)` in `daydrift-theme.js:44` is a synchronous XMLHttpRequest that blocks the main thread on every page load. Should use `fetch()` or async XHR instead.

- [ ] **Remove legacy drift fields from `buildDailyDrift`** — `accentHue`, `accentSaturation`, `accentLightness` are always zero and never meaningfully used. They were superseded by the multi-channel accent system (`accentLinkHue`, `accentFillHue`, `accentGlowHue`). Also clean up legacy fallbacks in `driftProfileForKey` that reference `drift.hue`.

- [ ] **Rename stale `circadian-*` identifiers** — ~50+ references remain in CSS classes (`dynamic-circadian-theme`, `dynamic-circadian-hide-dark-toggle`), JS constants (`CSS_ID = 'dynamic-circadian-theme-css'`), dataset attributes (`data-circadian-phase`, `data-circadian-preview`), and runtime variable names. **Warning: This is a breaking change** for anyone with custom CSS targeting these selectors. Consider a major version bump or a migration note.

### Low Priority

- [ ] **Add test for `composerTextForMinute` branches** — Four branches (before fade-in, during fade-in, dark period, fade-out) are untested. Module-private, so needs either export or indirect testing approach.

- [ ] **Test the plugin loader** — `load-daydrift-theme.js` has zero tests. Requires browser ES module context, so may need integration testing approach.