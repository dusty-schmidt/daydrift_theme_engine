import {
  DEFAULT_PHASES,
  buildDailyDrift,
  browserTimezone,
  findPhaseWindow,
  interpolatePalette,
  makePaletteForDate,
  smoothstep,
  MINUTES_PER_DAY,
} from './daydrift-engine.mjs';

const CSS_ID = 'dynamic-circadian-theme-css';
const UPDATE_MS = 30_000;

// ── Composer text transition boundaries (minutes since midnight) ──────────
const COMPOSER_FADE_IN = 480;            // 8:00 AM
const COMPOSER_DARK_START = 600;         // 10:00 AM
const COMPOSER_DARK_END = 960;           // 4:00 PM
const COMPOSER_FADE_OUT = 1080;          // 6:00 PM
const COMPOSER_TRANSITION_MINUTES = 120; // duration of each fade transition
const PREVIOUS_DARK_MODE_KEY = 'daydriftTheme.previousDarkMode';

// ── Composer dark text fallback colors ───────────────────────────────────────
const COMPOSER_DARK_TEXT = '#27292b';
const COMPOSER_DARK_TEXT_MUTED = '#44494b';
let intervalId = null;
let observer = null;

export default function initDaydriftTheme(pluginBaseUrl = window.__daydriftThemePluginBaseUrl || '/plugins/daydrift_theme_engine/') {
  try {
    handleCleanupMarker();
    injectStyles(pluginBaseUrl);
    forceThemeOwnerMode();
    startThemeLoop();
    startDarkToggleHider();
  } catch (e) {
    console.warn('Daydrift Theme Engine: init failed, using default theme', e);
  }
}

function handleCleanupMarker() {
  // Non-blocking: fetch the marker asynchronously so we don't stall page load.
  fetch('/usr/plugins/.daydrift_cleanup')
    .then(r => r.ok ? r.json() : null)
    .then(marker => {
      if (!marker || marker.action !== 'restore_previous_darkmode') return;
      const previous = localStorage.getItem('daydriftTheme.previousDarkMode');
      if (previous !== null) {
        if (previous === '' || previous === null) {
          localStorage.removeItem('darkMode');
        } else {
          localStorage.setItem('darkMode', previous);
        }
      } else {
        localStorage.removeItem('darkMode');
      }
      for (const key of (marker.keys || [])) {
        localStorage.removeItem(key);
      }
      fetch('/usr/plugins/.daydrift_cleanup', { method: 'DELETE' }).catch(() => {});
    })
    .catch(() => {}); // Marker file doesn't exist — normal state
}

function injectStyles(pluginBaseUrl) {
  if (document.getElementById(CSS_ID)) return;
  const link = document.createElement('link');
  link.id = CSS_ID;
  link.rel = 'stylesheet';
  link.href = new URL('webui/daydrift-theme.css?v=1.0.0', pluginBaseUrl).href;
  document.head.appendChild(link);
}

function startThemeLoop() {
  if (intervalId) clearInterval(intervalId);
  const apply = () => {
    const state = makePaletteForDate(new Date(), browserTimezone());
    applyPalette(state);
  };
  apply();
  intervalId = window.setInterval(apply, UPDATE_MS);
}

function mixHexColor(a, b, t) {
  const x = smoothstep(t);
  const left = parseHexColor(a);
  const right = parseHexColor(b);
  if (!left || !right) return x < 0.5 ? a : b;
  const channel = (i) => Math.round(left[i] + (right[i] - left[i]) * x).toString(16).padStart(2, '0');
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

function parseHexColor(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!match) return null;
  const value = match[1];
  return [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16));
}

function composerTextForMinute(minuteOfDay, frameText, darkText = COMPOSER_DARK_TEXT) {
  const minute = ((minuteOfDay % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  if (minute >= COMPOSER_DARK_START && minute <= COMPOSER_DARK_END) return darkText;
  if (minute >= COMPOSER_FADE_IN && minute < COMPOSER_DARK_START) return mixHexColor(frameText, darkText, (minute - COMPOSER_FADE_IN) / COMPOSER_TRANSITION_MINUTES);
  if (minute > COMPOSER_DARK_END && minute <= COMPOSER_FADE_OUT) return mixHexColor(darkText, frameText, (minute - COMPOSER_DARK_END) / COMPOSER_TRANSITION_MINUTES);
  return frameText;
}

function applyPalette(state) {
  const root = document.documentElement;
  const composerText = composerTextForMinute(state.minuteOfDay, state.palette.frameText || state.palette.text);
  const composerTextMuted = composerTextForMinute(state.minuteOfDay, state.palette.frameTextMuted || state.palette.textMuted, COMPOSER_DARK_TEXT_MUTED);
  const map = {
    '--color-background': state.palette.background,
    '--color-text': state.palette.text,
    '--color-text-muted': state.palette.textMuted,
    '--color-frame-text': state.palette.frameText || state.palette.text,
    '--color-composer-text': composerText,
    '--color-composer-text-muted': composerTextMuted,
    '--color-sidebar-text': state.palette.sidebarText || state.palette.frameText || state.palette.text,
    '--color-window-text': state.palette.windowText || state.palette.text,
    '--color-chat-text': state.palette.chatText || state.palette.windowText || state.palette.text,
    '--color-background-text': state.palette.backgroundText || state.palette.text,
    '--color-primary': state.palette.primary,
    '--color-secondary': state.palette.secondary,
    '--color-accent': state.palette.accent,
    '--color-message-bg': state.palette.messageBg,
    '--color-highlight': state.palette.highlight,
    '--color-message-text': state.palette.messageText,
    '--color-panel': state.palette.panel,
    '--color-border': state.palette.border,
    '--color-input': state.palette.input,
    '--color-input-focus': state.palette.inputFocus,
    '--color-chat-background': state.palette.chatBackground,
    '--color-table-row': state.palette.tableRow,
    '--color-error-text': state.palette.errorText,
    '--color-warning-text': state.palette.warningText,
    '--color-frame-text-muted': state.palette.frameTextMuted || state.palette.textMuted,
    '--color-chat-accent': state.palette.chatAccent || state.palette.accent,
    '--color-chat-primary': state.palette.chatPrimary || state.palette.primary,
    '--color-chat-highlight': state.palette.chatHighlight || state.palette.highlight,
    '--color-error-panel': state.palette.errorPanel || state.palette.errorText,
    '--dynamic-circadian-phase': `'${state.phase.current.name}`,
    '--dynamic-circadian-timezone': `'${state.timezone}'`
  };
  for (const [key, value] of Object.entries(map)) root.style.setProperty(key, value);

  for (const [key, value] of Object.entries(state.palette)) {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--color-${cssKey}`, value);
  }

  document.body.classList.add('dynamic-circadian-theme');
  const pct = Math.round(state.phase.t * 100);
  const phaseName = state.phase.current.name.replace(/_/g, ' ');
  document.body.dataset.circadianPhase = state.phase.current.name;
  document.body.dataset.circadianPhaseDisplay = `${phaseName} · ${pct}%`;

  window.DaydriftTheme = Object.freeze({
    phase: state.phase.current.name,
    palette: Object.freeze({ ...state.palette }),
    updatedAt: new Date().toISOString(),
  });
}

function forceThemeOwnerMode() {
  try {
    if (localStorage.getItem(PREVIOUS_DARK_MODE_KEY) === null) {
      localStorage.setItem(PREVIOUS_DARK_MODE_KEY, localStorage.getItem('darkMode') ?? '');
    }
    localStorage.setItem('darkMode', 'true');
  } catch {}
  document.body.classList.remove('light-mode');
  document.body.classList.add('dark-mode', 'dynamic-circadian-theme');
}

function startDarkToggleHider() {
  let scheduled = false;
  let found = false;
  const hide = () => {
    scheduled = false;
    const list = document.querySelector('#preferences-collapse');
    if (!list) return false;
    for (const li of list.querySelectorAll('li')) {
      const label = li.querySelector('.switch-label, span');
      if (label && label.textContent.trim().toLowerCase() === 'dark mode') {
        li.classList.add('dynamic-circadian-hide-dark-toggle');
        li.setAttribute('aria-hidden', 'true');
        found = true;
      }
    }
    return found;
  };
  const scheduleHide = () => {
    if (scheduled || found) return;
    scheduled = true;
    requestAnimationFrame(() => {
      if (hide() && observer) observer.disconnect();
    });
  };
  if (hide()) return;
  if (observer) observer.disconnect();
  observer = new MutationObserver(scheduleHide);
  const target = document.querySelector('.pref-section') || document.querySelector('#left-sidebar') || document.body;
  observer.observe(target, { childList: true, subtree: true });
}
