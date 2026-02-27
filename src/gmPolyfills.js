/** Polyfills for TamperMonkey (GM_*) APIs.
 * These replacements use browser-native equivalents so the script can run
 * as a plain bookmarklet without a userscript manager.
 * @since 0.89.0
 */

// GM_info polyfill — version is replaced at build time via esbuild `define`
globalThis.GM_info = {
  script: {
    name: 'Blue Marble',
    version: __BUILD_VERSION__
  }
};

// Storage polyfills (localStorage-backed, mirrors GM_getValue/GM.setValue semantics)
globalThis.GM_getValue = function(key, defaultValue) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : defaultValue;
  } catch {
    return defaultValue;
  }
};

globalThis.GM_deleteValue = function(key) {
  try { localStorage.removeItem(key); } catch {}
};

globalThis.GM = {
  setValue: async function(key, value) {
    try { localStorage.setItem(key, String(value)); } catch {}
  },

  // Download polyfill: fetch the URL, get a blob, trigger via a temporary <a> tag
  download: async function({ url, name, onload, onerror, ontimeout } = {}) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
      if (typeof onload === 'function') onload();
    } catch (e) {
      if (typeof onerror === 'function') onerror('download_failed', e?.message);
    }
  }
};

// No-op polyfills — CSS is injected externally by the bookmarklet loader
globalThis.GM_addStyle = function() {};
globalThis.GM_getResourceText = function() { return ''; };

// No-op — was only used for telemetry (removed)
globalThis.GM_xmlhttpRequest = function() {};
