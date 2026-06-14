export default async function loadDaydriftTheme() {
  const pluginBaseUrl = new URL('../../../', import.meta.url);
  window.__daydriftThemePluginBaseUrl = pluginBaseUrl.href.replace(/\/$/, '');

  // Keep this version query in sync with plugin.yaml so browser ES-module caches
  // cannot keep serving an older runtime after a plugin update/reload.
  const runtimeUrl = new URL('webui/daydrift-theme.js?v=1.0.0', pluginBaseUrl).href;
  const module = await import(runtimeUrl);

  if (typeof module.default === 'function') {
    module.default(pluginBaseUrl.href);
  }
}
