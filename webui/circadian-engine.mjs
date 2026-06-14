const MINUTES_PER_DAY = 1440;

export const PALETTE_KEYS = [
  'background', 'text', 'textMuted', 'primary', 'secondary', 'accent',
  'messageBg', 'highlight', 'messageText', 'panel', 'border', 'input',
  'inputFocus', 'chatBackground', 'tableRow', 'errorText', 'warningText'
];

// Derived tokens computed in enforceReadableText, not source palette keys.
// CSS consumers access these from the result object.
export const DERIVED_KEYS = [
  'frameText', 'sidebarText', 'windowText', 'chatText', 'backgroundText',
  'messageText', 'frameTextMuted'
];

export const DEFAULT_PHASES = [
  phase('midnight', 0, palette('#09090b', '#e4e4e7', '#a1a2aa', '#8c47d1', '#7339ac', '#8c30e8', '#0c0d12', '#994ce6', '#e4e4e7', '#0c0d12', '#181a25', '#0c0d12', '#1b1d32', '#14141a', '#0c0d12', '#ff6b7a', '#d7a85f')),
  phase('deep_night', 120, palette('#09090b', '#e4e4e7', '#a1a2aa', '#8c47d1', '#7339ac', '#8c30e8', '#0c0d12', '#994ce6', '#e4e4e7', '#0c0d12', '#181a25', '#0c0d12', '#1b1d32', '#14141a', '#0c0d12', '#ff6b7a', '#d7a85f')),
  phase('predawn', 240, palette('#09090b', '#e4e4e7', '#a1a2aa', '#8c47d1', '#7339ac', '#8c30e8', '#0c0d12', '#994ce6', '#e4e4e7', '#0c0d12', '#181a25', '#0c0d12', '#1b1d32', '#14141a', '#0c0d12', '#ff6b7a', '#d7a85f')),
  phase('dawn', 360, palette('#17181c', '#e4e5e7', '#999ba3', '#8040bf', '#663d8f', '#7a3db8', '#2e3038', '#8541c8', '#e4e5e7', '#2e3038', '#303241', '#2e3038', '#33374d', '#22242c', '#2e3038', '#ff6b7a', '#d7a85f')),
  phase('sunrise', 480, palette('#22242a', '#dfdfe2', '#94969e', '#733fa6', '#613f83', '#6e3c9f', '#3d3e43', '#7a3db8', '#dfdfe2', '#3d3e43', '#3e404c', '#3d3e43', '#414558', '#3e414c', '#3d3e43', '#ff6b7a', '#d7a85f')),
  phase('morning', 600, palette('#686464', '#27292b', '#44494b', '#2e1547', '#331c4a', '#2e1547', '#726e6e', '#361556', '#27292b', '#686464', '#a1a7aa', '#979a9b', '#a4aaa1', '#e0e2e6', '#979a9b', '#686464', '#d7a85f')),
  phase('late_morning', 720, palette('#686464', '#282b27', '#464b44', '#2e1547', '#331c4a', '#2e1547', '#726e6e', '#361556', '#282b27', '#686464', '#a4aaa1', '#989b97', '#a7aaa4', '#e5e7eb', '#989b97', '#686464', '#d7a85f')),
  phase('solar_noon', 840, palette('#686464', '#2b2927', '#4b4944', '#2e1547', '#331c4a', '#2e1547', '#726e6e', '#361556', '#2b2927', '#686464', '#aaa7a1', '#9b9a97', '#ada9a4', '#e7e9ec', '#9b9a97', '#686464', '#d7a85f')),
  phase('afternoon', 960, palette('#686464', '#2b2927', '#4b4844', '#2e1547', '#331c4a', '#2e1547', '#726e6e', '#361556', '#2b2927', '#686464', '#aaa6a1', '#9b9997', '#ada8a4', '#e2e4e8', '#9b9997', '#686464', '#d7a85f')),
  phase('golden_hour', 1080, palette('#32343a', '#dcdce0', '#92949c', '#5a298c', '#4c2d70', '#572291', '#3e4046', '#602ca3', '#dcdce0', '#32343a', '#52545c', '#32343a', '#444650', '#6b6e7a', '#32343a', '#ff6b7a', '#d7a85f')),
  phase('dusk', 1200, palette('#131218', '#e6e4e7', '#99949e', '#8039c6', '#663894', '#7a31c4', '#26252e', '#853bce', '#e6e4e7', '#201f26', '#2b2a33', '#201f26', '#2c2a38', '#332640', '#201f26', '#ff6b7a', '#d7a85f')),
  phase('late_evening', 1320, palette('#0b0b0e', '#e7e7e9', '#a1a2aa', '#853bce', '#6b36a1', '#8529e0', '#0e0f15', '#8c3cdd', '#e7e7e9', '#0e0f15', '#14151f', '#0e0f15', '#171826', '#14151f', '#0e0f15', '#ff6b7a', '#d7a85f'))
];

function palette(background, text, textMuted, primary, secondary, accent, messageBg, highlight, messageText, panel, border, input, inputFocus, chatBackground, tableRow, errorText, warningText) {
  return { background, text, textMuted, primary, secondary, accent, messageBg, highlight, messageText, panel, border, input, inputFocus, chatBackground, tableRow, errorText, warningText };
}

function phase(name, minute, palette) { return { name, minute, palette }; }


function enforceReadableText(result) {
  // Agent Zero has both dark frame surfaces and light daytime chat/window surfaces.
  // A single text color cannot reliably serve both, so expose scoped tokens and
  // let CSS apply them to the correct regions.
  result.frameText = readableTextFor(result.panel, 4.5);
  result.sidebarText = readableTextFor(result.panel, 4.5);
  result.windowText = readableTextFor(result.chatBackground, 4.5);
  result.chatText = readableTextFor(result.chatBackground, 4.5);
  result.backgroundText = readableTextFor(result.background, 4.5);
  result.messageText = readableTextFor(result.messageBg, 4.5);

  // Keep the legacy/global tokens conservative for existing UI areas. Scoped CSS
  // below overrides chat transcript content with --color-chat-text.
  result.text = result.frameText;
  result.textMuted = readableMutedTextFor(result.chatBackground, result.chatText, 3.0);

  // Panel-specific muted text for sidebar/frame areas (separate from chat muted).
  result.frameTextMuted = readableMutedTextFor(result.panel, result.frameText, 3.0);

  // Save pre-adjustment values for cross-surface token computation.
  const baseAccent = result.accent;
  const basePrimary = result.primary;
  const baseHighlight = result.highlight;
  const baseErrorText = result.errorText;

  // Accent/primary/highlight: prioritize PANEL contrast (sidebar buttons, nav items).
  result.primary = ensureContrast(basePrimary, result.panel, 3.0);
  result.accent = ensureContrast(baseAccent, result.panel, 3.0);
  result.highlight = ensureContrast(baseHighlight, result.panel, 3.0);

  // Chat-surface accent variants (links, highlights in transcript on light backgrounds).
  result.chatPrimary = ensureContrast(basePrimary, result.chatBackground, 3.0);
  result.chatAccent = ensureContrast(baseAccent, result.chatBackground, 3.0);
  result.chatHighlight = ensureContrast(baseHighlight, result.chatBackground, 3.0);

  // Border: ensure readable against panel.
  result.border = ensureContrast(result.border, result.panel, 2.0);

  // Secondary: ensure readable against panel.
  result.secondary = ensureContrast(result.secondary, result.panel, 2.5);

  // Error/warning text: prioritize CHAT contrast (status messages in transcript).
  result.errorText = ensureContrast(baseErrorText, result.chatBackground, 4.5);
  // Error on panel: separate token for panel surfaces.
  result.errorPanel = ensureContrast(baseErrorText, result.panel, 4.5);
  result.warningText = ensureContrast(result.warningText, result.chatBackground, 4.5);
}

function chooseSharedReadableText(backgrounds, preferred, minRatio) {
  const candidates = [preferred, '#f8fbff', '#101820', '#ffffff', '#000000', '#172033', '#edf3ff'];
  let best = candidates[0];
  let bestWorst = -Infinity;
  for (const candidate of candidates) {
    const worst = Math.min(...backgrounds.map(bg => contrastRatio(candidate, bg)));
    if (worst >= minRatio) return candidate;
    if (worst > bestWorst) {
      bestWorst = worst;
      best = candidate;
    }
  }
  return best;
}

function readableTextFor(background, minRatio) {
  const bg = hexToHsl(background);
  const preferred = bg.l > 0.46 ? '#101820' : '#f8fbff';
  return ensureContrast(preferred, background, minRatio);
}

function readableMutedTextFor(background, textColor, minRatio) {
  const bg = hexToHsl(background);
  const text = hexToHsl(textColor);
  const mixed = hslToHex(text.h, Math.max(0.12, text.s * 0.65), bg.l > 0.46 ? 0.32 : 0.72);
  return ensureContrast(mixed, background, minRatio);
}

function ensureContrast(foreground, background, minRatio) {
  if (contrastRatio(foreground, background) >= minRatio) return foreground;
  const bg = hexToHsl(background);
  const fg = hexToHsl(foreground);
  const targetLight = bg.l <= 0.5;
  let best = foreground;
  let minDiff = Infinity;
  let found = false;
  for (let i = 0; i <= 100; i += 1) {
    const l = i / 100;
    if (targetLight && l < bg.l) continue;
    if (!targetLight && l > bg.l) continue;
    const candidate = hslToHex(fg.h, fg.s, l);
    const ratio = contrastRatio(candidate, background);
    if (ratio >= minRatio) {
      const diff = Math.abs(l - fg.l);
      if (diff < minDiff) {
        minDiff = diff;
        best = candidate;
        found = true;
      }
    }
  }
  if (found) return best;
  return bg.l > 0.5 ? '#000000' : '#ffffff';
}

// Find a single foreground color that achieves minimum contrast against TWO backgrounds.
// Walks lightness up and down from the original, picking the candidate with the
// best worst-case ratio across both surfaces.
function ensureBetterBoth(foreground, bg1, bg2, minRatio) {
  const r1 = contrastRatio(foreground, bg1);
  const r2 = contrastRatio(foreground, bg2);
  if (r1 >= minRatio && r2 >= minRatio) return foreground;

  const fg = hexToHsl(foreground);
  let best = foreground;
  let bestWorst = Math.min(r1, r2);

  // Search lightness spectrum: try both lighter and darker than original
  for (let i = 0; i <= 100; i += 1) {
    for (const dir of [i / 100, 1 - i / 100]) {
      const candidate = hslToHex(fg.h, fg.s, dir);
      const worst = Math.min(contrastRatio(candidate, bg1), contrastRatio(candidate, bg2));
      if (worst > bestWorst) {
        best = candidate;
        bestWorst = worst;
      }
      if (worst >= minRatio) return candidate;
    }
  }
  return best;
}

function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [lr, lg, lb] = [r, g, b].map(channel => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}



function ensureFrameWindowSeparation(result) {
  const frameKeys = ['panel', 'messageBg', 'tableRow'];
  for (const frameKey of frameKeys) {
    if (result[frameKey] === result.chatBackground) {
      const color = hexToHsl(result.chatBackground);
      color.l = clamp01(color.l + (color.l > 0.5 ? -0.035 : 0.035));
      color.s = clamp01(color.s + 0.012);
      result.chatBackground = hslToHex(color.h + 1.5, color.s, color.l);
      break;
    }
  }
}


export function clampMinuteOfDay(minute) {
  return ((Math.trunc(minute) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

export function smoothstep(t) {
  const x = Math.max(0, Math.min(1, Number(t)));
  return x * x * (3 - 2 * x);
}

export function findPhaseWindow(phases, minuteOfDay) {
  const sorted = [...phases].sort((a, b) => a.minute - b.minute);
  const minute = clampMinuteOfDay(minuteOfDay);
  let current = sorted[sorted.length - 1];
  let next = sorted[0];
  for (let i = 0; i < sorted.length; i++) {
    const candidate = sorted[i];
    const following = sorted[(i + 1) % sorted.length];
    const start = candidate.minute;
    const end = following.minute > start ? following.minute : following.minute + MINUTES_PER_DAY;
    const normalizedMinute = minute >= start ? minute : minute + MINUTES_PER_DAY;
    if (normalizedMinute >= start && normalizedMinute < end) {
      current = candidate;
      next = following;
      return { current, next, t: (normalizedMinute - start) / (end - start) };
    }
  }
  return { current, next, t: 0 };
}

export function buildDailyDrift(localDate, timezone = 'local') {
  // Ensure unique daily drift per user by generating a persistent random ID on first load
  let userId = 'default';
  try {
    userId = localStorage.getItem('daydriftTheme.userId');
    if (!userId) {
      userId = Math.random().toString(16).substring(2, 10);
      localStorage.setItem('daydriftTheme.userId', userId);
    }
  } catch {
    // Fallback for restricted environments (e.g., strict privacy modes)
  }

  const seed = xmur3(`${timezone}|${localDate}|${userId}|daydrift_theme_engine`)();
  const random = mulberry32(seed);
  return {
    // Keep overall surfaces stable so day/night still reads clearly.
    surfaceHue: round((random() * 2 - 1) * 1.0, 3),
    surfaceSaturation: round((random() * 2 - 1) * 0.01, 4),
    surfaceLightness: round((random() * 2 - 1) * 0.006, 4),

    // Treat panels as a physical frame and chat as an outside window.
    // They move together through the day, but with separate daily character.
    frameHue: round((random() * 2 - 1) * 2.2, 3),
    frameSaturation: round((random() * 2 - 1) * 0.018, 4),
    frameLightness: round((random() * 2 - 1) * 0.012, 4),
    windowHue: round((random() * 2 - 1) * 3.4, 3),
    windowSaturation: round((random() * 2 - 1) * 0.026, 4),
    windowLightness: round((random() * 2 - 1) * 0.018, 4),

    // Full color wheel daily anchor — accent sub-channels offset from this base.
    accentBaseHue: round(random() * 360, 1),

    // Multi-channel accent drift: three sub-channels evolve independently so
    // different accent elements (links, fills, highlights) can wander apart
    // over time. Each shares the same bounds but rolls its own random walk.
    // accentLink: most variable, for the 'accent' key (links, focus rings)
    accentLinkHue: round((random() * 2 - 1) * 14, 3),
    accentLinkSaturation: round((random() * 2 - 1) * 0.075, 4),
    accentLinkLightness: round((random() * 2 - 1) * 0.035, 4),
    // accentFill: slightly more conservative, for the 'primary' key (buttons, fills)
    accentFillHue: round((random() * 2 - 1) * 11, 3),
    accentFillSaturation: round((random() * 2 - 1) * 0.065, 4),
    accentFillLightness: round((random() * 2 - 1) * 0.030, 4),
    // accentGlow: more neutral/saturated, for the 'highlight' key (selection, glow)
    accentGlowHue: round((random() * 2 - 1) * 9, 3),
    accentGlowSaturation: round((random() * 2 - 1) * 0.080, 4),
    accentGlowLightness: round((random() * 2 - 1) * 0.040, 4),
    // Legacy channel kept for backward compatibility (averaged blend of the three).
    accentHue: 0,
    accentSaturation: 0,
    accentLightness: 0,
    accentBias: round((random() * 2 - 1) * 7, 3)
  };
}

export function interpolatePalette(phases, minuteOfDay, drift = {}) {
  const { current, next, t } = findPhaseWindow(phases, minuteOfDay);
  const eased = smoothstep(t);
  const result = {};

  // Cosine wave for dynamic midday desaturation: 0 at midnight (0), 1 at noon (720)
  const rad = (minuteOfDay / 1440) * 2 * Math.PI;
  const dayFactor = 0.5 - 0.5 * Math.cos(rad);

  for (const key of PALETTE_KEYS) {
    const a = hexToHsl(current.palette[key]);
    const b = hexToHsl(next.palette[key]);
    const profile = driftProfileForKey(key);
    const isAccentKey = (key === 'accent' || key === 'primary' || key === 'highlight');
    
    let h = (isAccentKey && drift.accentBaseHue !== undefined) ? (profile.hue || 0) : (mixHue(a.h, b.h, eased) + (profile.hue || 0));
    let s = clamp01(lerp(a.s, b.s, eased) + (profile.saturation || 0));
    let l = clamp01(lerp(a.l, b.l, eased) + (profile.lightness || 0));

    if (isAccentKey) {
      // 1. Smoothly rotate the hue during the day (shifting up to 180 degrees at noon when dim)
      h = (h + dayFactor * 180) % 360;
      // 2. Dimmer effect: highly vibrant and bright at night, dim and desaturated during peak day
      s = clamp01(s * (0.15 + 0.85 * (1.0 - dayFactor)));
      l = clamp01(l * (0.50 + 0.50 * (1.0 - dayFactor)));
    }

    result[key] = hslToHex(h, s, l);
  }
  ensureFrameWindowSeparation(result);

  enforceReadableText(result);

  // Generate dynamic, harmoniously shifting secondary colors derived from the main accent color
  const acc = hexToHsl(result.accent);
  const s_tool = hslToHex((acc.h + 60) % 360, acc.s, acc.l);
  const s_codeExe = hslToHex((acc.h + 120) % 360, acc.s, acc.l);
  const s_browser = hslToHex((acc.h + 180) % 360, acc.s, acc.l);
  const s_util = hslToHex((acc.h + 240) % 360, acc.s, acc.l);
  const s_agent = hslToHex((acc.h + 300) % 360, acc.s, acc.l);
  const s_info = hslToHex((acc.h + 30) % 360, acc.s, acc.l);
  
  // Scale warning and error saturation/lightness in sync with the main accent dimmer wave
  const warnHsl = hexToHsl(result.warningText || '#d7a85f');
  const errHsl = hexToHsl(result.errorText || '#ff6b7a');
  warnHsl.s = clamp01(warnHsl.s * (0.25 + 0.75 * (1.0 - dayFactor)));
  warnHsl.l = clamp01(warnHsl.l * (0.50 + 0.50 * (1.0 - dayFactor)));
  errHsl.s = clamp01(errHsl.s * (0.25 + 0.75 * (1.0 - dayFactor)));
  errHsl.l = clamp01(errHsl.l * (0.50 + 0.50 * (1.0 - dayFactor)));

  result.messageTool = s_tool;
  result.messageCodeExe = s_codeExe;
  result.messageBrowser = s_browser;
  result.messageUtil = s_util;
  result.messageAgent = s_agent;
  result.messageInfo = s_info;
  result.messageWarning = hslToHex(warnHsl.h, warnHsl.s, warnHsl.l);
  result.messageError = hslToHex(errHsl.h, errHsl.s, errHsl.l);

  return result;

  function driftProfileForKey(key) {
    const accentKeys = new Set(['accent', 'highlight', 'primary']);
    const secondaryAccentKeys = new Set(['secondary', 'border', 'inputFocus']);
    const statusKeys = new Set(['errorText', 'warningText']);
    if (accentKeys.has(key)) {
      // Accent keys use accentBaseHue exclusively — the interpolated phase hue
      // is completely ignored. Sub-channel offsets (with multipliers) provide
      // separation while keeping all accent types in the same daily color family.
      if (key === 'accent') {
        // Links: full base hue + link sub-offset + accentBias
        return {
          hue: (drift.accentBaseHue || 0) + (drift.accentLinkHue || 0) * 0.3 + (drift.accentBias || 0),
          saturation: (drift.accentLinkSaturation || 0) || drift.saturation || 0,
          lightness: (drift.accentLinkLightness || 0) || drift.lightness || 0,
        };
      } else if (key === 'primary') {
        // Fills: base hue + fill sub-offset, more conservative
        return {
          hue: (drift.accentBaseHue || 0) + (drift.accentFillHue || 0) * 0.25,
          saturation: (drift.accentFillSaturation || 0) || drift.saturation || 0,
          lightness: (drift.accentFillLightness || 0) || drift.lightness || 0,
        };
      } else {
        // 'highlight' → accentGlow: base hue + glow sub-offset, more neutral/saturated
        return {
          hue: (drift.accentBaseHue || 0) + (drift.accentGlowHue || 0) * 0.2,
          saturation: (drift.accentGlowSaturation || 0) || drift.saturation || 0,
          lightness: (drift.accentGlowLightness || 0) || drift.lightness || 0,
        };
      }
    }
    if (secondaryAccentKeys.has(key)) {
      // Secondary accents use the average of all 3 sub-channels, scaled down.
      const avgHue = ((drift.accentLinkHue || 0) + (drift.accentFillHue || 0) + (drift.accentGlowHue || 0)) / 3;
      const avgSat = ((drift.accentLinkSaturation || 0) + (drift.accentFillSaturation || 0) + (drift.accentGlowSaturation || 0)) / 3;
      const avgLight = ((drift.accentLinkLightness || 0) + (drift.accentFillLightness || 0) + (drift.accentGlowLightness || 0)) / 3;
      return {
        hue: (avgHue || drift.hue || 0) * 0.35,
        saturation: (avgSat || drift.saturation || 0) * 0.35,
        lightness: (avgLight || drift.lightness || 0) * 0.2,
      };
    }
    if (key === 'panel' || key === 'messageBg' || key === 'tableRow' || key === 'input') {
      return {
        hue: (drift.surfaceHue || drift.hue || 0) + (drift.frameHue || 0),
        saturation: (drift.surfaceSaturation || drift.saturation || 0) + (drift.frameSaturation || 0),
        lightness: (drift.surfaceLightness || drift.lightness || 0) + (drift.frameLightness || 0),
      };
    }
    if (key === 'chatBackground') {
      return {
        hue: (drift.surfaceHue || drift.hue || 0) + (drift.windowHue || 0),
        saturation: (drift.surfaceSaturation || drift.saturation || 0) + (drift.windowSaturation || 0),
        lightness: (drift.surfaceLightness || drift.lightness || 0) + (drift.windowLightness || 0),
      };
    }
    if (statusKeys.has(key)) {
      return { hue: 0, saturation: 0, lightness: 0 };
    }
    return {
      hue: drift.surfaceHue || drift.hue || 0,
      saturation: drift.surfaceSaturation || drift.saturation || 0,
      lightness: drift.surfaceLightness || drift.lightness || 0,
    };
  }
}

export function makePaletteForDate(date = new Date(), timezone = browserTimezone()) {
  const parts = localParts(date, timezone);
  const minuteOfDay = parts.hour * 60 + parts.minute;
  const drift = buildDailyDrift(parts.date, timezone);
  return {
    timezone,
    localDate: parts.date,
    minuteOfDay,
    drift,
    phase: findPhaseWindow(DEFAULT_PHASES, minuteOfDay),
    palette: interpolatePalette(DEFAULT_PHASES, minuteOfDay, drift)
  };
}

export function browserTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'local'; }
  catch { return 'local'; }
}

function localParts(date, timezone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone === 'local' ? undefined : timezone,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  const hour = Number(parts.hour === '24' ? '0' : parts.hour);
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour, minute: Number(parts.minute) };
}

function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16) };
}

function hslToHex(h, s, l) {
  const hue = (((h % 360) + 360) % 360) / 360;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hue2rgb(p, q, t) {
  let x = t;
  if (x < 0) x += 1;
  if (x > 1) x -= 1;
  if (x < 1 / 6) return p + (q - p) * 6 * x;
  if (x < 1 / 2) return q;
  if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
  return p;
}

function toHex(value) { return Math.round(clamp01(value) * 255).toString(16).padStart(2, '0'); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function round(v, places) { const m = 10 ** places; return Math.round(v * m) / m; }
function mixHue(a, b, t) {
  const delta = ((((b - a) % 360) + 540) % 360) - 180;
  return a + delta * t;
}
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function seed() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(seed) {
  return function rand() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
