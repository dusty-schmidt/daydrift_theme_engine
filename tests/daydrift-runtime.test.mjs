import test from 'node:test';
import assert from 'node:assert/strict';

function makeFakeDom() {
  const links = [];
  const rootStyle = new Map();
  const rowDark = makeElement('li', '');
  const rowSpeech = makeElement('li', '');
  const darkLabel = makeElement('span', 'Dark mode');
  const speechLabel = makeElement('span', 'Speech');
  rowDark.children.push(darkLabel);
  rowSpeech.children.push(speechLabel);
  rowDark.querySelector = (selector) => selector.includes('span') ? darkLabel : null;
  rowSpeech.querySelector = (selector) => selector.includes('span') ? speechLabel : null;
  const preferences = {
    querySelectorAll(selector) { return selector === 'li' ? [rowDark, rowSpeech] : []; }
  };
  const body = makeElement('body', '');
  body.dataset = {};
  const documentElement = { style: { setProperty(key, value) { rootStyle.set(key, value); } } };
  const document = {
    head: { appendChild(node) { links.push(node); } },
    body,
    documentElement,
    getElementById(id) { return links.find((link) => link.id === id) || null; },
    createElement(tag) { return makeElement(tag, ''); },
    querySelector(selector) {
      if (selector === '#preferences-collapse') return preferences;
      if (selector === '.pref-section' || selector === '#left-sidebar') return null;
      return null;
    }
  };
  return { document, links, rootStyle, rowDark, rowSpeech };
}

function makeElement(tag, textContent) {
  const classes = new Set();
  return {
    tag,
    textContent,
    children: [],
    dataset: {},
    rel: '',
    href: '',
    id: '',
    style: {},
    classList: {
      add(...names) { for (const name of names) classes.add(name); },
      remove(...names) { for (const name of names) classes.delete(name); },
      contains(name) { return classes.has(name); }
    },
    setAttribute(name, value) { this[name] = value; },
    appendChild(child) { this.children.push(child); return child; },
    querySelector() { return null; }
  };
}

test('runtime injects stylesheet, applies palette variables, owns dark mode, and hides Dark mode row', async () => {
  const original = {
    window: globalThis.window,
    document: globalThis.document,
    localStorage: globalThis.localStorage,
    MutationObserver: globalThis.MutationObserver,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    performance: globalThis.performance,
  };
  const fake = makeFakeDom();
  const storage = new Map([['darkMode', 'false']]);
  const intervals = [];
  try {
    globalThis.document = fake.document;
    globalThis.localStorage = {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); }
    };
    let nowMs = 0;
    globalThis.performance = { now() { return nowMs; } };
    globalThis.window = {
      setInterval(fn, ms) { intervals.push({ fn, ms }); return intervals.length; },
      clearInterval() {},
      __daydriftThemeDebug: false,
    };
    globalThis.MutationObserver = class FakeMutationObserver {
      constructor(callback) { this.callback = callback; this.disconnected = false; }
      observe() { this.observed = true; }
      disconnect() { this.disconnected = true; }
    };
    globalThis.requestAnimationFrame = (fn) => fn();

    const { default: initDaydriftTheme } = await import(`../webui/daydrift-theme.js?test=${Date.now()}`);
    initDaydriftTheme('file:///a0/usr/plugins/daydrift_theme_engine/');

    assert.equal(fake.links.length, 1);
    assert.equal(fake.links[0].id, 'dynamic-daydrift-theme-css');
    assert.match(fake.links[0].href, /daydrift-theme\.css(?:\?v=\d+\.\d+\.\d+)?$/);
    assert.equal(storage.get('darkMode'), 'true');
    assert.equal(storage.get('daydriftTheme.previousDarkMode'), 'false');
    assert.equal(fake.document.body.classList.contains('dark-mode'), true);
    assert.equal(fake.document.body.classList.contains('dynamic-daydrift-theme'), true);
    for (const key of ['--color-background', '--color-accent', '--color-chat-text', '--color-error-text', '--color-warning-text', '--color-composer-text', '--color-composer-text-muted']) {
      assert.match(fake.rootStyle.get(key), /^#[0-9a-f]{6}$/i, key);
    }
    assert.equal(fake.rowDark.classList.contains('dynamic-daydrift-hide-dark-toggle'), true);
    assert.equal(fake.rowDark['aria-hidden'], 'true');
    assert.equal(fake.rowSpeech.classList.contains('dynamic-daydrift-hide-dark-toggle'), false);
    assert.ok(globalThis.window.DaydriftTheme.phase);
    assert.ok(globalThis.window.DaydriftTheme.palette);
    // Phase depends on current time, so verify it's a valid non-empty string
    assert.ok(fake.document.body.dataset.daydriftPhase.length > 0);
  } finally {
    globalThis.window = original.window;
    globalThis.document = original.document;
    globalThis.localStorage = original.localStorage;
    globalThis.MutationObserver = original.MutationObserver;
    globalThis.requestAnimationFrame = original.requestAnimationFrame;
    globalThis.performance = original.performance;
  }
});
