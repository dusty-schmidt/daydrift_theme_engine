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
  phase('midnight', 0, palette('#060913', '#e9efff', '#9aa8c7', '#8fa3d6', '#151b2b', '#6f86ff', '#101624', '#415ad9', '#edf3ff', '#0b101c', '#26324f', '#080d18', '#11192a', '#0b111e', '#121a2a', '#ff6b7a', '#d7a85f')),
  phase('deep_night', 120, palette('#030610', '#dce8ff', '#8797b8', '#6f83b8', '#10182a', '#536cf0', '#0b1120', '#344ac5', '#e7efff', '#070b15', '#202b46', '#050914', '#0c1220', '#080d18', '#0e1524', '#ff6275', '#c99c59')),
  phase('predawn', 270, palette('#071021', '#e7f1ff', '#91a8c4', '#78a4c8', '#16263a', '#3c91d0', '#0f1c2e', '#2f7fbb', '#edf6ff', '#0b1726', '#28445e', '#081322', '#102033', '#0d1a2b', '#132236', '#f36b78', '#cba15d')),
  phase('dawn', 330, palette('#171321', '#fff0ea', '#c9aeba', '#c9989d', '#2c2435', '#ff7f72', '#211b2b', '#d96475', '#fff5f0', '#1a1524', '#4a3a54', '#120f1b', '#211a2b', '#1d1725', '#282033', '#f26b78', '#d7a064')),
  phase('sunrise', 390, palette('#1e242a', '#e8edf3', '#8a97a5', '#6090a8', '#2c3a46', '#75a8bc', '#26303a', '#4d8298', '#e8edf3', '#232c35', '#3c4a56', '#1e242a', '#2c3a46', '#a8b8c8', '#303b46', '#d46060', '#d4a060')),
  phase('morning', 450, palette('#202c2d', '#f8fdff', '#b8cbd3', '#83bdd0', '#34494e', '#65c4d8', '#253a40', '#4ba8c2', '#f8fdff', '#263235', '#4c6770', '#1d2d31', '#2a4248', '#b5c4d1', '#33474c', '#dc686a', '#d2aa50')),
  phase('late_morning', 570, palette('#2b332e', '#fdfff9', '#c4cec4', '#93bda9', '#3f4c43', '#7dc69e', '#324038', '#5aa97a', '#fdfff9', '#30372f', '#5b695d', '#263028', '#35443a', '#bccad6', '#3f4c43', '#d96862', '#d0ad50')),
  phase('solar_noon', 720, palette('#36372b', '#fffff5', '#d4d0b5', '#c1ba80', '#4e4e3b', '#e2c85a', '#3d3e32', '#c4ad3f', '#fffff7', '#3b3a2f', '#6d6a4c', '#2f3025', '#444638', '#c2ced8', '#4a4a39', '#d7635d', '#d9aa3f')),
  phase('afternoon', 840, palette('#343126', '#fffaf0', '#d2c4a4', '#c8aa70', '#504736', '#dba85c', '#3f382b', '#bd8d3d', '#fffaf2', '#456b8a', '#6f5f45', '#2d271d', '#453a2b', '#b5c4d1', '#4c4332', '#dc665e', '#d9a148')),
  phase('golden_hour', 1020, palette('#1e2d3a', '#f0f6ff', '#9ab8cc', '#7aafc8', '#2d4a5e', '#5b9fc0', '#253848', '#4a8fb0', '#edf6ff', '#3d5f78', '#507d96', '#1e2d3a', '#2d4a5e', '#a8b8c8', '#304d62', '#e46a60', '#d4a849')),
  phase('dusk', 1110, palette('#191423', '#f4edff', '#b9adc9', '#a691c4', '#312943', '#c67bc6', '#241d31', '#9d65b0', '#fbf2ff', '#1d1728', '#514062', '#15111d', '#261e32', '#211a2c', '#2f263c', '#f06a7a', '#d2a15f')),
  phase('evening', 1200, palette('#0e1422', '#edf4ff', '#a8b9d0', '#889fca', '#212d45', '#6d8bff', '#172033', '#526cd8', '#f1f6ff', '#111827', '#354862', '#0c1220', '#172236', '#141d2e', '#1e293d', '#ff6879', '#d7a85e')),
  phase('late_evening', 1320, palette('#090d18', '#e8eef9', '#9ba9bf', '#7888ac', '#1b2234', '#636fe8', '#121827', '#4555bd', '#edf2ff', '#0d1320', '#30394f', '#080c16', '#121827', '#0f1522', '#171d2b', '#ff6475', '#d6a663'))
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
  result.errorText = ensureContrast(baseErrorText, result.chatBackground, 3.0);
  // Error on panel: separate token for panel surfaces.
  result.errorPanel = ensureContrast(baseErrorText, result.panel, 3.0);
  result.warningText = ensureContrast(result.warningText, result.chatBackground, 3.0);
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
  let bestRatio = contrastRatio(foreground, background);
  for (let i = 0; i <= 100; i += 1) {
    const l = targetLight ? i / 100 : 1 - i / 100;
    const candidate = hslToHex(fg.h, fg.s, l);
    const ratio = contrastRatio(candidate, background);
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
    if (ratio >= minRatio) return candidate;
  }
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
  for (const key of PALETTE_KEYS) {
    const a = hexToHsl(current.palette[key]);
    const b = hexToHsl(next.palette[key]);
    const profile = driftProfileForKey(key);
    const h = mixHue(a.h, b.h, eased) + (profile.hue || 0);
    const s = clamp01(lerp(a.s, b.s, eased) + (profile.saturation || 0));
    const l = clamp01(lerp(a.l, b.l, eased) + (profile.lightness || 0));
    result[key] = hslToHex(h, s, l);
  }
  ensureFrameWindowSeparation(result);

  // Lighten panel surfaces so sidebars/bottom-panels/cards aren't near-black.
  // This applies systematically across all phases — night phases stay dark but
  // readable, day phases become comfortably light.
  for (const key of ['panel', 'messageBg', 'tableRow', 'input']) {
    const c = hexToHsl(result[key]);
    // Adaptive boost: full +0.06 for dark panels, scaling down as panel gets lighter.
    // At L>0.25 the boost tapers to zero. Cap at 0.45 to keep frameText readable.
    const boostScale = c.l < 0.25 ? 1.0 : Math.max(0, 1.0 - (c.l - 0.25) / 0.20);
    c.l = Math.min(c.l + 0.06 * boostScale, 0.45);
    result[key] = hslToHex(c.h, c.s, c.l);
  }

  enforceReadableText(result);
  return result;

  function driftProfileForKey(key) {
    const accentKeys = new Set(['accent', 'highlight', 'primary']);
    const secondaryAccentKeys = new Set(['secondary', 'border', 'inputFocus']);
    const statusKeys = new Set(['errorText', 'warningText']);
    if (accentKeys.has(key)) {
      // Map each accent key to its own sub-channel for independent evolution.
      let subHue, subSat, subLight;
      if (key === 'accent') {
        subHue = drift.accentLinkHue;
        subSat = drift.accentLinkSaturation;
        subLight = drift.accentLinkLightness;
      } else if (key === 'primary') {
        subHue = drift.accentFillHue;
        subSat = drift.accentFillSaturation;
        subLight = drift.accentFillLightness;
      } else {
        // 'highlight' → accentGlow
        subHue = drift.accentGlowHue;
        subSat = drift.accentGlowSaturation;
        subLight = drift.accentGlowLightness;
      }
      return {
        hue: (subHue || drift.hue || 0) + (key === 'accent' ? (drift.accentBias || 0) : 0),
        saturation: subSat || drift.saturation || 0,
        lightness: subLight || drift.lightness || 0,
      };
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
