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
    classList: {
      add(...names) { for (const name of names) classes.add(name); },
      remove(...names) { for (const name of names) classes.delete(name); },
      contains(name) { return classes.has(name); }
    },
    setAttribute(name, value) { this[name] = value; },
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
    globalThis.window = {
      setInterval(fn, ms) { intervals.push({ fn, ms }); return intervals.length; },
      clearInterval() {},
      __dynamicCircadianThemeDebug: false,
    };
    globalThis.MutationObserver = class FakeMutationObserver {
      constructor(callback) { this.callback = callback; this.disconnected = false; }
      observe() { this.observed = true; }
      disconnect() { this.disconnected = true; }
    };
    globalThis.requestAnimationFrame = (fn) => fn();

    const { default: initDynamicCircadianTheme } = await import(`../webui/circadian-theme.js?test=${Date.now()}`);
    initDynamicCircadianTheme('file:///a0/usr/plugins/dynamic_circadian_theme/');

    assert.equal(fake.links.length, 1);
    assert.equal(fake.links[0].id, 'dynamic-circadian-theme-css');
    assert.match(fake.links[0].href, /circadian-theme\.css(?:\?v=\d+\.\d+\.\d+)?$/);
    assert.equal(storage.get('darkMode'), 'true');
    assert.equal(storage.get('dynamicCircadianTheme.previousDarkMode'), 'false');
    assert.equal(fake.document.body.classList.contains('dark-mode'), true);
    assert.equal(fake.document.body.classList.contains('dynamic-circadian-theme'), true);
    for (const key of ['--color-background', '--color-accent', '--color-chat-text', '--color-error-text', '--color-warning-text']) {
      assert.match(fake.rootStyle.get(key), /^#[0-9a-f]{6}$/i, key);
    }
    assert.equal(fake.rowDark.classList.contains('dynamic-circadian-hide-dark-toggle'), true);
    assert.equal(fake.rowDark['aria-hidden'], 'true');
    assert.equal(fake.rowSpeech.classList.contains('dynamic-circadian-hide-dark-toggle'), false);
    assert.equal(globalThis.window.DynamicCircadianTheme.timezone, undefined);
    assert.ok(globalThis.window.DynamicCircadianTheme.phase);
    assert.ok(globalThis.window.DynamicCircadianTheme.palette);
    assert.equal(typeof globalThis.window.DynamicCircadianTheme.preview.start, 'function');
    assert.equal(typeof globalThis.window.DynamicCircadianTheme.preview.stop, 'function');
  } finally {
    globalThis.window = original.window;
    globalThis.document = original.document;
    globalThis.localStorage = original.localStorage;
    globalThis.MutationObserver = original.MutationObserver;
    globalThis.requestAnimationFrame = original.requestAnimationFrame;
  }
});
