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
const PREVIOUS_DARK_MODE_KEY = 'daydriftTheme.previousDarkMode';
const PREVIEW_UPDATE_MS = 250;
let intervalId = null;
let previewIntervalId = null;
let previewAutoStopId = null;
let observer = null;
let lastTimezone = null;
let lastLocalDate = null;

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
  // Check if the uninstall hook wrote a cleanup marker
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/usr/plugins/.daydrift_cleanup', false);
    xhr.send();
    if (xhr.status === 200) {
      try {
        const marker = JSON.parse(xhr.responseText);
        if (marker.action === 'restore_previous_darkmode') {
          // Restore previous darkMode value before this plugin existed
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
          // Remove all daydriftTheme keys
          for (const key of (marker.keys || [])) {
            localStorage.removeItem(key);
          }
          // Clean up the marker file
          fetch('/usr/plugins/.daydrift_cleanup', { method: 'DELETE' }).catch(() => {});
        }
      } catch {}
    }
  } catch {
    // Marker file doesn't exist — normal state, do nothing
  }
}

function injectStyles(pluginBaseUrl) {
  if (document.getElementById(CSS_ID)) return;
  const link = document.createElement('link');
  link.id = CSS_ID;
  link.rel = 'stylesheet';
  link.href = new URL('webui/circadian-theme.css?v=0.3.1', pluginBaseUrl).href;
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

function smoothComposerMix(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function mixHexColor(a, b, t) {
  const x = smoothComposerMix(t);
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

function composerTextForMinute(minuteOfDay, frameText, darkText = '#27292b') {
  const minute = ((minuteOfDay % 1440) + 1440) % 1440;
  if (minute >= 600 && minute <= 960) return darkText;
  if (minute >= 480 && minute < 600) return mixHexColor(frameText, darkText, (minute - 480) / 120);
  if (minute > 960 && minute <= 1080) return mixHexColor(darkText, frameText, (minute - 960) / 120);
  return frameText;
}

function applyPalette(state, previewActive = false) {
  const root = document.documentElement;
  const composerText = composerTextForMinute(state.minuteOfDay, state.palette.frameText || state.palette.text);
  const composerTextMuted = composerTextForMinute(state.minuteOfDay, state.palette.frameTextMuted || state.palette.textMuted, '#44494b');
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
  
  // Dynamically map all properties in state.palette to --color-kebab-case CSS variables
  for (const [key, value] of Object.entries(state.palette)) {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--color-${cssKey}`, value);
  }

  document.body.classList.add('dynamic-circadian-theme');
  const pct = Math.round(state.phase.t * 100);
  const phaseName = state.phase.current.name.replace(/_/g, ' ');
  document.body.dataset.circadianPhase = state.phase.current.name;
  document.body.dataset.circadianPhaseDisplay = `${phaseName} · ${pct}%`;
  document.body.dataset.circadianPreview = previewActive ? 'true' : 'false';

  // Handle HTML Stop Overlay dynamically for preview
  const doc = (typeof window !== 'undefined' && window.top) ? window.top.document : document;
  let overlay = doc.getElementById('daydrift-preview-overlay');
  if (previewActive) {
    if (!overlay) {
      overlay = doc.createElement('div');
      overlay.id = 'daydrift-preview-overlay';
      overlay.style.cssText = `
        position: fixed;
        right: 1.5rem;
        bottom: 1.5rem;
        z-index: 99999;
        padding: 0.5rem 0.8rem;
        border: 1px solid color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
        border-radius: 0.6rem;
        background: color-mix(in srgb, var(--color-panel) 92%, transparent);
        color: var(--color-frame-text) !important;
        font-size: 0.75rem;
        letter-spacing: 0.04em;
        box-shadow: 0 0 1.5rem color-mix(in srgb, var(--color-accent) 22%, transparent);
        display: flex;
        align-items: center;
        gap: 0.7rem;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 500;
      `;
      
      const textSpan = doc.createElement('span');
      textSpan.id = 'daydrift-preview-text';
      textSpan.style.textTransform = 'uppercase';
      overlay.appendChild(textSpan);
      
      const stopBtn = doc.createElement('button');
      stopBtn.textContent = 'STOP';
      stopBtn.style.cssText = `
        background: var(--color-accent);
        color: var(--color-background);
        border: none;
        border-radius: 0.3rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.65rem;
        font-weight: bold;
        cursor: pointer;
        letter-spacing: 0.05em;
        transition: opacity 0.2s;
      `;
      stopBtn.onmouseover = () => stopBtn.style.opacity = '0.85';
      stopBtn.onmouseout = () => stopBtn.style.opacity = '1';
      stopBtn.onclick = () => {
        const pWin = window.top || window;
        if (pWin.DaydriftTheme && pWin.DaydriftTheme.preview) {
          pWin.DaydriftTheme.preview.stop();
        } else if (window.DaydriftTheme && window.DaydriftTheme.preview) {
          window.DaydriftTheme.preview.stop();
        }
      };
      overlay.appendChild(stopBtn);
      doc.body.appendChild(overlay);
    }
    const textSpan = doc.getElementById('daydrift-preview-text');
    if (textSpan) {
      textSpan.textContent = `${phaseName} · ${pct}%`;
    }
  } else {
    if (overlay) {
      overlay.remove();
    }
  }

  const diagnostic = {
    phase: state.phase.current.name,
    palette: Object.freeze({ ...state.palette }),
    previewActive,
    preview: previewController,
    updatedAt: new Date().toISOString(),
  };
  window.DaydriftTheme = Object.freeze(
    window.__daydriftThemeDebug === true ? { ...state, previewActive, preview: previewController, updatedAt: diagnostic.updatedAt } : diagnostic
  );
}

const previewController = Object.freeze({
  start(durationMs = 45_000, autoStop = false) {
    return startPreview(durationMs, autoStop);
  },
  stop() {
    stopPreview(true);
  },
});

function startPreview(durationMs = 45_000, autoStop = false) {
  const totalDuration = Math.max(5_000, Number(durationMs) || 45_000);
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (previewIntervalId) clearInterval(previewIntervalId);
  if (previewAutoStopId) clearTimeout(previewAutoStopId);

  const timezone = browserTimezone();
  const liveState = makePaletteForDate(new Date(), timezone);
  lastTimezone = liveState.timezone;
  // Randomize preview seed date so each new preview session gets a completely different accent color
  const randDay = Math.floor(Math.random() * 28) + 1;
  const randMonth = Math.floor(Math.random() * 12) + 1;
  lastLocalDate = `preview-2026-${String(randMonth).padStart(2, '0')}-${String(randDay).padStart(2, '0')}`;
  const start = performance.now();

  const apply = () => {
    const elapsed = performance.now() - start;
    const cycleIndex = Math.floor(elapsed / totalDuration);
    const progress = (elapsed % totalDuration) / totalDuration;
    // Offset progress by 720 minutes so that the cycle rollover happens at noon when accents are completely dimmed off
    const minuteOfDay = (Math.floor(progress * 1440) + 720) % 1440;
    const seedDate = `${lastLocalDate}-${cycleIndex}`;
    applyPalette(makePreviewState(minuteOfDay, seedDate, lastTimezone), true);
  };

  apply();
  previewIntervalId = window.setInterval(apply, PREVIEW_UPDATE_MS);

  if (autoStop) {
    previewAutoStopId = window.setTimeout(() => {
      stopPreview(true);
    }, totalDuration);
  }

  return `Daydrift Theme Engine preview started. Click STOP on the WebUI floating panel or run window.DaydriftTheme.preview.stop() to exit.`;
}

function stopPreview(returnToLiveTime = true) {
  if (previewIntervalId) {
    clearInterval(previewIntervalId);
    previewIntervalId = null;
  }
  if (previewAutoStopId) {
    clearTimeout(previewAutoStopId);
    previewAutoStopId = null;
  }
  delete document.body.dataset.circadianPreview;
  if (typeof window !== 'undefined' && window.top) {
    delete window.top.document.body.dataset.circadianPreview;
  }
  const doc = (typeof window !== 'undefined' && window.top) ? window.top.document : document;
  const overlay = doc.getElementById('daydrift-preview-overlay');
  if (overlay) overlay.remove();
  if (returnToLiveTime) startThemeLoop();
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('daydrift-preview-stopped'));
    } catch (e) {}
  }
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
