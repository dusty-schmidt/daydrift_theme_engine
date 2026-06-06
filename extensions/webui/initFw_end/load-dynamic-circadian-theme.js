export default async function loadDynamicCircadianTheme() {
  const pluginBaseUrl = new URL('../../../', import.meta.url);
  window.__dynamicCircadianThemePluginBaseUrl = pluginBaseUrl.href.replace(/\/$/, '');

  // Keep this version query in sync with plugin.yaml so browser ES-module caches
  // cannot keep serving an older runtime after a plugin update/reload.
  const runtimeUrl = new URL('webui/circadian-theme.js?v=0.1.9', pluginBaseUrl).href;
  const module = await import(runtimeUrl);

  if (typeof module.default === 'function') {
    module.default(pluginBaseUrl.href);
  }
}
