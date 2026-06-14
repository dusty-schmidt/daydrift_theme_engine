import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PHASES,
  PALETTE_KEYS,
  WCAG_AA_NORMAL_TEXT,
  WCAG_AA_LARGE_TEXT,
  buildDailyDrift,
  clampMinuteOfDay,
  dayDimmer,
  findPhaseWindow,
  interpolatePalette,
  makePaletteForDate,
  smoothstep,
} from '../webui/daydrift-engine.mjs';

test('clampMinuteOfDay wraps arbitrary minutes into one local day', () => {
  assert.equal(clampMinuteOfDay(0), 0);
  assert.equal(clampMinuteOfDay(1440), 0);
  assert.equal(clampMinuteOfDay(-1), 1439);
  assert.equal(clampMinuteOfDay(1501), 61);
});

test('findPhaseWindow handles normal and midnight wrap-around windows', () => {
  const morning = findPhaseWindow(DEFAULT_PHASES, 8 * 60);
  assert.equal(morning.current.name, 'sunrise');
  assert.equal(morning.next.name, 'morning');
  assert.ok(morning.t >= 0 && morning.t <= 1);

  const afterMidnight = findPhaseWindow(DEFAULT_PHASES, 30);
  assert.equal(afterMidnight.current.name, 'midnight');
  assert.equal(afterMidnight.next.name, 'deep_night');
  assert.ok(afterMidnight.t >= 0 && afterMidnight.t <= 1);
});

test('smoothstep eases endpoints and midpoint deterministically', () => {
  assert.equal(smoothstep(0), 0);
  assert.equal(smoothstep(1), 1);
  assert.equal(smoothstep(0.5), 0.5);
});

test('buildDailyDrift is stable for a date/timezone and changes across days', () => {
  const a = buildDailyDrift('2026-06-02', 'America/New_York');
  const b = buildDailyDrift('2026-06-02', 'America/New_York');
  const c = buildDailyDrift('2026-06-03', 'America/New_York');
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.ok(Math.abs(a.surfaceHue) <= 1.0);
  assert.ok(Math.abs(a.surfaceSaturation) <= 0.01);
  assert.ok(Math.abs(a.surfaceLightness) <= 0.006);
  assert.ok(Math.abs(a.frameHue) <= 2.2);
  assert.ok(Math.abs(a.frameSaturation) <= 0.018);
  assert.ok(Math.abs(a.frameLightness) <= 0.012);
  assert.ok(Math.abs(a.windowHue) <= 3.4);
  assert.ok(Math.abs(a.windowSaturation) <= 0.026);
  assert.ok(Math.abs(a.windowLightness) <= 0.018);
  assert.ok(Math.abs(a.accentHue) <= 14);
  assert.ok(Math.abs(a.accentSaturation) <= 0.075);
  assert.ok(Math.abs(a.accentLightness) <= 0.035);
  assert.ok(Math.abs(a.accentBias) <= 7);
});

test('interpolatePalette returns complete bounded CSS hex palette', () => {
  const drift = { hue: 3, saturation: 0.01, lightness: -0.01 };
  const palette = interpolatePalette(DEFAULT_PHASES, 7 * 60 + 30, drift);
  for (const key of ['background', 'text', 'textMuted', 'primary', 'secondary', 'accent', 'messageBg', 'highlight', 'messageText', 'panel', 'border', 'input', 'inputFocus', 'chatBackground', 'tableRow']) {
    assert.match(palette[key], /^#[0-9a-f]{6}$/i, key);
  }
});

test('makePaletteForDate combines browser timezone date with deterministic phase color', () => {
  const date = new Date('2026-06-02T14:00:00-04:00');
  const result = makePaletteForDate(date, 'America/New_York');
  assert.equal(result.timezone, 'America/New_York');
  assert.equal(result.localDate, '2026-06-02');
  assert.equal(result.minuteOfDay, 14 * 60);
  assert.ok(result.phase.current.name.includes('noon'));
  assert.match(result.palette.background, /^#[0-9a-f]{6}$/i);
});


test('DEFAULT_PHASES data is sorted, unique, bounded, and palette-complete', () => {
  const names = new Set();
  let previousMinute = -1;
  for (const phase of DEFAULT_PHASES) {
    assert.ok(phase.minute >= 0 && phase.minute < 1440, `${phase.name} minute is in day`);
    assert.ok(phase.minute > previousMinute, `${phase.name} phases remain sorted`);
    previousMinute = phase.minute;
    assert.equal(names.has(phase.name), false, `${phase.name} is unique`);
    names.add(phase.name);
    for (const key of PALETTE_KEYS) {
      assert.match(phase.palette[key], /^#[0-9a-f]{6}$/i, `${phase.name}.${key}`);
    }
  }
});

test('interpolatePalette returns all required palette keys plus managed contrast tokens', () => {
  const palette = interpolatePalette(DEFAULT_PHASES, 720, { hue: 0, saturation: 0, lightness: 0, accentBias: 0 });
  for (const key of PALETTE_KEYS) {
    assert.match(palette[key], /^#[0-9a-f]{6}$/i, key);
  }
});

test('findPhaseWindow returns exact phase at every configured phase boundary', () => {
  for (let i = 0; i < DEFAULT_PHASES.length; i++) {
    const current = DEFAULT_PHASES[i];
    const next = DEFAULT_PHASES[(i + 1) % DEFAULT_PHASES.length];
    const window = findPhaseWindow(DEFAULT_PHASES, current.minute);
    assert.equal(window.current.name, current.name);
    assert.equal(window.next.name, next.name);
    assert.equal(window.t, 0);
  }
  const lastMinute = findPhaseWindow(DEFAULT_PHASES, 1439);
  assert.equal(lastMinute.current.name, 'late_evening');
  assert.equal(lastMinute.next.name, 'midnight');
  assert.ok(lastMinute.t > 0 && lastMinute.t < 1);
});

test('makePaletteForDate respects local date rollover in target timezones', () => {
  const tokyo = makePaletteForDate(new Date('2026-06-02T16:30:00Z'), 'Asia/Tokyo');
  assert.equal(tokyo.localDate, '2026-06-03');
  assert.equal(tokyo.minuteOfDay, 90);

  const newYork = makePaletteForDate(new Date('2026-06-02T02:30:00Z'), 'America/New_York');
  assert.equal(newYork.localDate, '2026-06-01');
  assert.equal(newYork.minuteOfDay, 22 * 60 + 30);
});


test('daily drift changes accents more than stable surfaces', () => {
  const base = interpolatePalette(DEFAULT_PHASES, 720, {});
  const drifted = interpolatePalette(DEFAULT_PHASES, 720, {
    surfaceHue: 1,
    surfaceSaturation: 0.005,
    surfaceLightness: 0.004,
    frameHue: 1.8,
    frameSaturation: 0.012,
    frameLightness: 0.008,
    windowHue: -2.6,
    windowSaturation: -0.015,
    windowLightness: 0.014,
    // Multi-channel accent drift: three sub-channels feed accent/primary/highlight
    accentBaseHue: 0,
    accentLinkHue: 12,
    accentLinkSaturation: 0.06,
    accentLinkLightness: 0.03,
    accentFillHue: 9,
    accentFillSaturation: 0.05,
    accentFillLightness: 0.025,
    accentGlowHue: 7,
    accentGlowSaturation: 0.07,
    accentGlowLightness: 0.035,
    accentBias: 5,
  });
  assert.notEqual(drifted.accent, base.accent);
  assert.notEqual(drifted.highlight, base.highlight);
  assert.notEqual(drifted.primary, base.primary);
  assert.notEqual(drifted.background, base.background);
  assert.notEqual(drifted.chatBackground, base.chatBackground);
});


test('multi-channel accent drift: sub-channels evolve independently', () => {
  // Verify the three accent sub-channels (accentLink, accentFill, accentGlow)
  // can drift apart from each other. The whole point of the multi-channel split
  // is that 'accent' (links), 'primary' (fills), and 'highlight' (glows) can
  // wander into different color spaces on the same day.
  const driftA = {
    accentBaseHue: 0,
    accentLinkHue: 14, accentLinkSaturation: 0.07, accentLinkLightness: 0.03,
    accentFillHue: -11, accentFillSaturation: -0.06, accentFillLightness: -0.025,
    accentGlowHue: 0, accentGlowSaturation: 0, accentGlowLightness: 0,
    accentBias: 0,
  };
  const driftB = {
    accentBaseHue: 0,
    accentLinkHue: 0, accentLinkSaturation: 0, accentLinkLightness: 0,
    accentFillHue: 11, accentFillSaturation: 0.06, accentFillLightness: 0.025,
    accentGlowHue: -9, accentGlowSaturation: -0.08, accentGlowLightness: -0.04,
    accentBias: 0,
  };
  const paletteA = interpolatePalette(DEFAULT_PHASES, 720, driftA);
  const paletteB = interpolatePalette(DEFAULT_PHASES, 720, driftB);
  // The 'accent' key in A should differ from B (link channel flipped polarity).
  assert.notEqual(paletteA.accent, paletteB.accent, 'accent (link channel) should drift independently');
  // The 'primary' key in A should differ from B (fill channel flipped polarity).
  assert.notEqual(paletteA.primary, paletteB.primary, 'primary (fill channel) should drift independently');
  // The 'highlight' key in A should differ from B (glow channel flipped polarity).
  assert.notEqual(paletteA.highlight, paletteB.highlight, 'highlight (glow channel) should drift independently');
  // Most importantly: the three accent-family keys in A should NOT all be the same.
  // (Proves the sub-channels are independently wired, not collapsed back into one.)
  assert.notEqual(paletteA.accent, paletteA.primary, 'accent and primary should diverge when sub-channels diverge');
  assert.notEqual(paletteA.primary, paletteA.highlight, 'primary and highlight should diverge when sub-channels diverge');
});


test('panel frames and chat window backgrounds never collapse to the same color', () => {
  for (const phase of DEFAULT_PHASES) {
    assert.notEqual(phase.palette.panel, phase.palette.chatBackground, `${phase.name} panel/chat anchors should differ`);
  }
  for (const minute of [0, 120, 270, 390, 450, 570, 720, 840, 1020, 1110, 1200, 1320, 1439]) {
    const palette = interpolatePalette(DEFAULT_PHASES, minute, {
      surfaceHue: 0,
      surfaceSaturation: 0,
      surfaceLightness: 0,
      frameHue: 0,
      frameSaturation: 0,
      frameLightness: 0,
      windowHue: 0,
      windowSaturation: 0,
      windowLightness: 0,
    });
    assert.notEqual(palette.panel, palette.chatBackground, `minute ${minute} panel/chat should differ`);
    assert.notEqual(palette.messageBg, palette.chatBackground, `minute ${minute} message/chat should differ`);
  }
});

test('day mode is visibly lighter than night mode while preserving frame/window contrast', () => {
  const night = interpolatePalette(DEFAULT_PHASES, 120, {});
  const noon = interpolatePalette(DEFAULT_PHASES, 720, {});
  assert.notEqual(noon.panel, noon.chatBackground);
  assert.notEqual(night.panel, night.chatBackground);
  assert.ok(hexLuminance(noon.chatBackground) > hexLuminance(night.chatBackground));
  assert.ok(hexLuminance(noon.panel) > hexLuminance(night.panel));
});

function hexLuminance(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}


test('palette text maintains WCAG contrast against managed backgrounds', () => {
  const drifts = [
    {},
    { surfaceHue: 1, surfaceSaturation: 0.01, surfaceLightness: 0.006, frameHue: 2.2, frameSaturation: 0.018, frameLightness: 0.012, windowHue: 3.4, windowSaturation: 0.026, windowLightness: 0.018, accentHue: 14, accentSaturation: 0.075, accentLightness: 0.035, accentBias: 7 },
    { surfaceHue: -1, surfaceSaturation: -0.01, surfaceLightness: -0.006, frameHue: -2.2, frameSaturation: -0.018, frameLightness: -0.012, windowHue: -3.4, windowSaturation: -0.026, windowLightness: -0.018, accentHue: -14, accentSaturation: -0.075, accentLightness: -0.035, accentBias: -7 },
  ];
  for (const minute of [0, 120, 270, 330, 390, 450, 570, 720, 840, 1020, 1110, 1200, 1320, 1439]) {
    for (const drift of drifts) {
      const palette = interpolatePalette(DEFAULT_PHASES, minute, drift);
      assert.ok(contrastRatio(palette.backgroundText, palette.background) >= WCAG_AA_NORMAL_TEXT, `backgroundText/background contrast failed at ${minute}`);
      assert.ok(contrastRatio(palette.messageText, palette.messageBg) >= WCAG_AA_NORMAL_TEXT, `messageText/messageBg contrast failed at ${minute}`);
      assert.ok(contrastRatio(palette.frameText, palette.panel) >= WCAG_AA_NORMAL_TEXT, `frameText/panel contrast failed at ${minute}`);
      assert.ok(contrastRatio(palette.windowText, palette.chatBackground) >= WCAG_AA_NORMAL_TEXT, `windowText/chatBackground contrast failed at ${minute}`);
      assert.ok(contrastRatio(palette.textMuted, palette.chatBackground) >= WCAG_AA_LARGE_TEXT, `muted/chatBackground contrast failed at ${minute}`);
    }
  }
});

function contrastRatio(fg, bg) {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  const rgb = [((n >> 16) & 255), ((n >> 8) & 255), (n & 255)].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

// ── Coverage: dayDimmer pure function ─────────────────────────────────────
test('dayDimmer returns min at dayFactor=1, max at dayFactor=0, and interpolates linearly', () => {
  // At peak day (dayFactor=1), should return min
  assert.equal(dayDimmer(1, 0.15, 1.0), 0.15);
  // At night (dayFactor=0), should return max
  assert.equal(dayDimmer(0, 0.15, 1.0), 1.0);
  // Default max=1.0
  assert.equal(dayDimmer(0, 0.5), 1.0);
  assert.equal(dayDimmer(1, 0.5), 0.5);
  // Linear interpolation at midpoint
  const mid = dayDimmer(0.5, 0, 1.0);
  assert.ok(Math.abs(mid - 0.5) < 0.001, `midpoint should be ~0.5, got ${mid}`);
  // With non-default range
  const range = dayDimmer(0.5, 0.2, 0.8);
  assert.ok(Math.abs(range - 0.5) < 0.001, `midpoint of [0.2,0.8] should be ~0.5, got ${range}`);
});

test('dayDimmer is monotonically decreasing as dayFactor increases', () => {
  let prev = dayDimmer(0, 0.1, 0.9);
  for (let i = 1; i <= 10; i++) {
    const current = dayDimmer(i / 10, 0.1, 0.9);
    assert.ok(current <= prev, `dayDimmer should decrease as dayFactor increases (${prev} -> ${current})`);
    prev = current;
  }
});

// ── Coverage: edge cases ──────────────────────────────────────────────────
test('interpolatePalette with empty phases throws (degenerate input)', () => {
  assert.throws(() => interpolatePalette([], 0, {}), {
    message: /undefined|Cannot read properties/i,
  }, 'empty phases array should throw because findPhaseWindow returns undefined');
});

test('interpolatePalette with incomplete single phase throws (degenerate input)', () => {
  const single = [
    { name: 'test', minute: 0, palette: { background: '#ff0000' } },
  ];
  assert.throws(() => interpolatePalette(single, 0, {}), {
    message: /undefined|null|Cannot read properties/i,
  }, 'incomplete palette should throw because interpolateColor needs full hex values');
});

test('interpolatePalette with missing drift fields defaults gracefully', () => {
  // Passing empty drift object should not throw
  const result = interpolatePalette(DEFAULT_PHASES, 720, {});
  assert.ok(result, 'empty drift should not cause failure');
  assert.match(result.background, /^#[0-9a-f]{6}$/i);
});

// ── Coverage: daydrift-phases.mjs direct module boundary ─────────────────
import { DEFAULT_PHASES as PHASES_DIRECT } from '../webui/daydrift-phases.mjs';

test('daydrift-phases.mjs exports DEFAULT_PHASES directly', () => {
  assert.ok(Array.isArray(PHASES_DIRECT), 'DEFAULT_PHASES should be an array');
  assert.equal(PHASES_DIRECT.length, 12, 'should have 12 phases');
  const names = PHASES_DIRECT.map(p => p.name);
  assert.deepEqual(names, [
    'midnight', 'deep_night', 'predawn', 'dawn', 'sunrise', 'morning',
    'late_morning', 'solar_noon', 'afternoon', 'golden_hour', 'dusk', 'late_evening',
  ]);
  // Verify the re-export from the engine matches the direct import
  assert.deepEqual(PHASES_DIRECT, DEFAULT_PHASES, 'engine re-export should equal direct phases import');
});

// ── Coverage: night phase differentiation ─────────────────────────────────
test('night phase interpolation produces distinct output across midnight/deep_night/predawn', () => {
  const zeroDrift = { surfaceHue: 0, surfaceSaturation: 0, surfaceLightness: 0, frameHue: 0, frameSaturation: 0, frameLightness: 0, windowHue: 0, windowSaturation: 0, windowLightness: 0, accentBias: 0 };
  const midnight = interpolatePalette(DEFAULT_PHASES, 0, zeroDrift);
  const deepNight = interpolatePalette(DEFAULT_PHASES, 120, zeroDrift);
  const predawn = interpolatePalette(DEFAULT_PHASES, 240, zeroDrift);
  // All three endpoints should differ from each other in at least one palette key
  const midnightVals = Object.values(midnight);
  const deepNightVals = Object.values(deepNight);
  const predawnVals = Object.values(predawn);
  const midnightSet = new Set(midnightVals);
  const deepNightSet = new Set(deepNightVals);
  const predawnSet = new Set(predawnVals);
  // midnight and deep_night should not be identical palettes
  assert.ok(midnightSet.size !== deepNightSet.size || !midnightVals.every((v, i) => v === deepNightVals[i]),
    'midnight and deep_night should produce different interpolated palettes');
  // deep_night and predawn should not be identical palettes
  assert.ok(deepNightSet.size !== predawnSet.size || !deepNightVals.every((v, i) => v === predawnVals[i]),
    'deep_night and predawn should produce different interpolated palettes');
  // Accent should show progression across the three phases
  assert.notEqual(midnight.accent, deepNight.accent, 'midnight and deep_night accents should differ');
  assert.notEqual(deepNight.accent, predawn.accent, 'deep_night and predawn accents should differ');
});

// ── Coverage: derived tokens from enforceReadableText ────────────────────
test('interpolatePalette returns all derived tokens as valid hex', () => {
  const palette = interpolatePalette(DEFAULT_PHASES, 720, { hue: 0, saturation: 0, lightness: 0, accentBias: 0 });
  const derivedKeys = [
    'frameText', 'sidebarText', 'windowText', 'chatText', 'backgroundText',
    'frameTextMuted', 'chatPrimary', 'chatAccent', 'chatHighlight',
    'errorPanel',
  ];
  for (const key of derivedKeys) {
    assert.ok(palette[key] != null, `${key} should exist on palette`);
    assert.match(palette[key], /^#[0-9a-f]{6}$/i, `${key} should be valid hex: ${palette[key]}`);
  }
});

test('day mode derived chat-family tokens exist and are valid hex', () => {
  // During daytime (minute 720), chat background is light and panel is dark.
  // The engine computes chat-prefixed tokens for readability against the light chat background.
  // If the base accent already passes contrast, chatAccent === accent (correct behavior).
  const palette = interpolatePalette(DEFAULT_PHASES, 720, { hue: 0, saturation: 0, lightness: 0, accentBias: 0 });
  assert.ok(palette.chatAccent != null, 'chatAccent should exist');
  assert.ok(palette.chatPrimary != null, 'chatPrimary should exist');
  assert.ok(palette.chatHighlight != null, 'chatHighlight should exist');
  assert.match(palette.chatAccent, /^#[0-9a-f]{6}$/i, 'chatAccent should be valid hex');
  assert.match(palette.chatPrimary, /^#[0-9a-f]{6}$/i, 'chatPrimary should be valid hex');
  assert.match(palette.chatHighlight, /^#[0-9a-f]{6}$/i, 'chatHighlight should be valid hex');
});

// ── Coverage: buildDailyDrift multi-channel accent fields ───────────────
test('buildDailyDrift includes all multi-channel accent fields within bounds', () => {
  const drift = buildDailyDrift('2026-06-02', 'America/New_York');
  // Verify multi-channel accent fields exist
  assert.ok('accentBaseHue' in drift, 'accentBaseHue should exist');
  assert.ok('accentLinkHue' in drift, 'accentLinkHue should exist');
  assert.ok('accentFillHue' in drift, 'accentFillHue should exist');
  assert.ok('accentGlowHue' in drift, 'accentGlowHue should exist');
  // Verify base hue is in [0, 360)
  assert.ok(drift.accentBaseHue >= 0 && drift.accentBaseHue < 360, `accentBaseHue ${drift.accentBaseHue} should be in [0, 360)`);
  // Verify sub-channel hues are within their bounds
  assert.ok(Math.abs(drift.accentLinkHue) <= 14, `accentLinkHue ${drift.accentLinkHue} should be within ±14`);
  assert.ok(Math.abs(drift.accentFillHue) <= 11, `accentFillHue ${drift.accentFillHue} should be within ±11`);
  assert.ok(Math.abs(drift.accentGlowHue) <= 9, `accentGlowHue ${drift.accentGlowHue} should be within ±9`);
  // Verify saturation and lightness sub-fields exist
  for (const channel of ['Link', 'Fill', 'Glow']) {
    assert.ok(`accent${channel}Saturation` in drift, `accent${channel}Saturation should exist`);
    assert.ok(`accent${channel}Lightness` in drift, `accent${channel}Lightness should exist`);
  }
});
