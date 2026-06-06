import {
  DEFAULT_PHASES,
  buildDailyDrift,
  browserTimezone,
  findPhaseWindow,
  interpolatePalette,
  makePaletteForDate,
} from './circadian-engine.mjs';

const CSS_ID = 'dynamic-circadian-theme-css';
const UPDATE_MS = 30_000;
const PREVIOUS_DARK_MODE_KEY = 'dynamicCircadianTheme.previousDarkMode';
const PREVIEW_UPDATE_MS = 250;
let intervalId = null;
let previewIntervalId = null;
let observer = null;
let lastTimezone = null;
let lastLocalDate = null;

export default function initDynamicCircadianTheme(pluginBaseUrl = window.__dynamicCircadianThemePluginBaseUrl || '/plugins/dynamic_circadian_theme/') {
  injectStyles(pluginBaseUrl);
  forceThemeOwnerMode();
  startThemeLoop();
  startDarkToggleHider();
}

function injectStyles(pluginBaseUrl) {
  if (document.getElementById(CSS_ID)) return;
  const link = document.createElement('link');
  link.id = CSS_ID;
  link.rel = 'stylesheet';
  link.href = new URL('webui/circadian-theme.css?v=0.1.9', pluginBaseUrl).href;
  document.head.appendChild(link);
}

function startThemeLoop() {
  stopPreview(false);
  if (intervalId) clearInterval(intervalId);
  const apply = () => {
    const state = makePaletteForDate(new Date(), browserTimezone());
    lastTimezone = state.timezone;
    lastLocalDate = state.localDate;
    applyPalette(state, false);
  };
  apply();
  intervalId = window.setInterval(apply, UPDATE_MS);
}

function applyPalette(state, previewActive = false) {
  const root = document.documentElement;
  const map = {
    '--color-background': state.palette.background,
    '--color-text': state.palette.text,
    '--color-text-muted': state.palette.textMuted,
    '--color-frame-text': state.palette.frameText || state.palette.text,
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
  document.body.classList.add('dynamic-circadian-theme');
  const pct = Math.round(state.phase.t * 100);
  const phaseName = state.phase.current.name.replace(/_/g, ' ');
  document.body.dataset.circadianPhase = state.phase.current.name;
  document.body.dataset.circadianPhaseDisplay = `${phaseName} · ${pct}%`;
  document.body.dataset.circadianPreview = previewActive ? 'true' : 'false';
  const diagnostic = {
    phase: state.phase.current.name,
    palette: Object.freeze({ ...state.palette }),
    previewActive,
    preview: previewController,
    updatedAt: new Date().toISOString(),
  };
  window.DynamicCircadianTheme = Object.freeze(
    window.__dynamicCircadianThemeDebug === true ? { ...state, previewActive, preview: previewController, updatedAt: diagnostic.updatedAt } : diagnostic
  );
}

const previewController = Object.freeze({
  start(durationMs = 60_000) {
    return startPreview(durationMs);
  },
  stop() {
    stopPreview(true);
  },
});

function startPreview(durationMs = 60_000) {
  const totalDuration = Math.max(5_000, Number(durationMs) || 60_000);
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (previewIntervalId) clearInterval(previewIntervalId);

  const timezone = browserTimezone();
  const liveState = makePaletteForDate(new Date(), timezone);
  lastTimezone = liveState.timezone;
  lastLocalDate = liveState.localDate;
  const start = performance.now();

  const apply = () => {
    const elapsed = performance.now() - start;
    const progress = (elapsed % totalDuration) / totalDuration;
    const minuteOfDay = Math.floor(progress * 1440);
    applyPalette(makePreviewState(minuteOfDay, lastLocalDate, lastTimezone), true);
  };

  apply();
  previewIntervalId = window.setInterval(apply, PREVIEW_UPDATE_MS);
  return `Dynamic Circadian Theme preview started: 24h cycle compressed into ${Math.round(totalDuration / 1000)}s. Run window.DynamicCircadianTheme.preview.stop() to return to live time.`;
}

function stopPreview(returnToLiveTime = true) {
  if (previewIntervalId) {
    clearInterval(previewIntervalId);
    previewIntervalId = null;
  }
  if (returnToLiveTime) startThemeLoop();
}

function makePreviewState(minuteOfDay, localDate, timezone) {
  const drift = buildDailyDrift(localDate || 'preview', timezone || 'local');
  return {
    timezone: timezone || 'local',
    localDate: localDate || 'preview',
    minuteOfDay,
    drift,
    phase: findPhaseWindow(DEFAULT_PHASES, minuteOfDay),
    palette: interpolatePalette(DEFAULT_PHASES, minuteOfDay, drift),
  };
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
